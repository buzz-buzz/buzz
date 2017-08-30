angular.module('spaModule', [
    'ngRoute',
    'mobile-angular-ui',
    'buzzHeaderModule',
    'wechatShareModule'
])
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/survey/:timestamp?', {
                templateUrl: 'survey.html',
                controller: 'surveyCtrl',
                controllerAs: 'surveyCtrl'
            })
            .when('/agreement', {
                templateUrl: 'agreement.html',
                controller: 'surveyCtrl',
                controllerAs: 'surveyCtrl'
            })
            .when('/survey/help-friend/:short_id/:friend_member_id', {
                templateUrl: 'help-friend.html',
                controller: 'helpFriendCtrl',
                controllerAs: 'helpFriendCtrl'
            });

        $routeProvider.otherwise('/survey/:timestamp?');
    }])
    .controller('surveyCtrl', ['$scope', '$rootScope', '$http', '$timeout', function ($scope, $rootScope, $http, $timeout) {
    }])
    .controller('surveyShareCtrl', ['$scope', '$rootScope', '$http', 'clientConfig', '$timeout', 'api', '$q', function ($scope, $rootScope, $http, clientConfig, $timeout, api, $q) {
        var strCookie = document.cookie;
        var arrCookie = strCookie.split(";");
        var member_id;
        for (var i = 0; i < arrCookie.length; i++) {
            var arr = arrCookie[i].split("=");
            if ("mid" == arr[0]) {
                member_id = arr[1];
                break;
            }
        }
        api.get(clientConfig.serviceUrls.sso.profile.load.frontEnd)
            .then(function (result) {
                var profile = result.data.result;

                var short_id = /\??short_id=(\w+)/.exec(location.search)[1];
                var myAnswer = document.getElementById("answer").innerHTML;
                var sharable = {
                    title: '孩子一个月看懂全球英语资讯？这不是痴人说梦',
                    desc: profile.display_name + '邀请你支持' + myAnswer,
                    link: location.origin + '/survey/help-friend/' + short_id + '/' + member_id,
                    imgUrl: 'https://resource.buzzbuzzenglish.com/new_buzz_logo.png'
                };
                $rootScope.wechatSharable = sharable;

                function wxReady() {
                    var dfd = $q.defer();

                    if (wx.isReady) {
                        dfd.resolve();
                    }

                    wx.ready(function () {
                        dfd.resolve();
                    });

                    return dfd.promise;
                }

                function wechatSharable(sharable) {
                    try {
                        console.log("CTRL");
                        $rootScope.wechatSharable.desc = sharable.desc;
                        $rootScope.wechatSharable.title = sharable.title;

                        wxReady().then(function () {
                            console.log("=======");

                            wx.onMenuShareTimeline(angular.extend({}, $rootScope.wechatSharable, {
                                title: $rootScope.wechatSharable.title + ' ' + $rootScope.wechatSharable.desc
                            }));

                            wx.onMenuShareAppMessage(angular.extend({}, $rootScope.wechatSharable));
                        });
                    } catch (ex) {
                        console.error(ex);
                    }
                }

                wechatSharable(sharable);
            });

        $timeout(function () {
            $('#dimmer')
                .dimmer('show');
        }, 2000);

        $scope.closeDimmer = function () {
            $('#dimmer')
                .dimmer('hide');
        };
    }])
    .controller('helpFriendCtrl', ['$scope', '$http', '$routeParams', '$timeout', function ($scope, $http, $routeParams, $timeout) {
        $scope.support = function () {
            $timeout(function () {
                supportFriend();
            }, 2000);
        };

        function gotoSurveyPage() {
            var timestamp = (new Date()).getTime();
            location.href = '/survey?short_id=' + $routeParams.short_id + '&time=' + timestamp;
        }

        function supportFriend() {
            $http.put('/service-proxy/surveys/help-friend/i-support', {
                short_id: $routeParams.short_id,
                friend_member_id: $routeParams.friend_member_id
            }).then(function (res) {
                gotoSurveyPage();
            });
        }

        $scope.giveUp = function () {
            gotoSurveyPage();
        };
    }]);