angular.module('signInModule', ['angularQueryParserModule', 'clientConfigModule', 'servicesModule', 'errorParserModule', 'trackingModule'])
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.defaults.headers.common['X-Request-With'] = 'XMLHttpRequest';
    }])
    .config(['$translateProvider', function ($translateProvider) {
        $translateProvider.useSanitizeValueStrategy(null);
        $translateProvider.translations('en', {}).translations('zh', {
            'Invalid user name or password': '错误的用户名或者密码',
            'Invalid identity or password': '错误的用户名或者密码',
            '/': '登录成功, 正在跳转中……',
            '/my/today': '登录成功, 正在跳转至今日课程页面……',
            '/my/history': '登录成功，正在跳转至历史课程页面……',
            '/my/progress': '登录成功，正在跳转至我的进度页面……',
            '/m/my/my': '登录成功，正在跳转至【我的】页面……',
            '/my/account': '登录成功，正在跳转至账号信息页面……'
        });

        $translateProvider.preferredLanguage('zh');
    }])
    .controller('signInCtrl', ['$scope', 'clientConfig', 'service', 'queryParser', 'serviceErrorParser', 'tracking', '$timeout', function ($scope, clientConfig, service, queryParser, serviceErrorParser, tracking, $timeout) {
        $scope.signInData = {
            account: '',
            password: ''
        };

        $scope.signIn = function () {
            tracking.sendX('log-in.login.beforeClick');
            service.post(clientConfig.serviceUrls.sso.signIn.frontEnd, {
                    value: $scope.signInData.account,
                    password: $scope.signInData.password,
                    return_url: queryParser.get('return_url'),
                    token: queryParser.get('token'),

                })
                .then(function (result) {
                    tracking.sendX('log-in.login.afterClick');
                    return result;
                })
                .catch(function (reason) {
                    var Message = reason.message.replace(/(\?[a-z]=.*\d)-[0-9]{1}-[0-9]{1}-[0-9]{13}(&[a-z]=.*\d{13})/g, '');
                    $scope.errorMessage = serviceErrorParser.getErrorMessage(Message);
                    tracking.sendX('log-in.login.afterClick.error', reason);
                });
        };

        tracking.sendX('log-in');

        var query = queryParser.parse();
        $scope.bindMobileMode = !!query.token;

        $scope.errDone = function () {
            $scope.errorMessage = null;
        };

        $scope.$watch('errorMessage', function (newValue, oldValue) {
            if (newValue) {
                $timeout(function () {
                    $scope.errDone();
                }, 3000);
            }
        });

    }])
    .controller('signInParentCtrl', ['$scope', function ($scope) {
        $scope.queryString = location.search;
    }]);