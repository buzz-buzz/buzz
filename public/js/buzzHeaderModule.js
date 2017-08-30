angular.module('buzzHeaderModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule', 'trackingModule', 'serviceCacheModule'])
    .run(['$rootScope', 'service', 'clientConfig', 'api', function ($rootScope, service, clientConfig, api) {
        api.get(clientConfig.serviceUrls.sso.profile.load.frontEnd)
            .then(function (result) {
                if (result.data.isSuccess) {
                    $rootScope.profile = result.data.result;
                    $rootScope.$broadcast('//profile:got', $rootScope.profile);
                    console.log('profile got');
                    if (!$rootScope.profile.avatar) {
                        $rootScope.profile.avatar = '/public/images/default_avatar.png';
                    }

                    if ($rootScope.profile.avatar && $rootScope.profile.avatar.indexOf('//upload.bridgeplus.cn') === 0 && !$rootScope.profile.avatar.match(/-minor$/)) {
                        $rootScope.profile.avatar += '-minor';
                    }

                    $rootScope.profile.displayName = $rootScope.profile.display_name || $rootScope.profile.name || $rootScope.profile.nick_name || $rootScope.profile.real_name;

                    api.get(clientConfig.serviceUrls.buzz.profile.memberTag.frontEnd)
                        .then(function (result) {
                            if (result.data && result.data.length > 0) {
                                $rootScope.profile.tags = result.data.map(function (t) {
                                    return t.tag_id;
                                }) || [];
                                $rootScope.payingMember = true;
                            } else {
                                $rootScope.profile.tags = [];
                            }
                        });
                } else {
                    // throw result.data;
                    console.error('尝试请求用户信息失败，因为还没有登录。')
                }
            });
    }])
    .factory('trackingX', ['tracking', '$rootScope', function (tracking, $rootScope) {
        return {
            sendX: function (eventName, data) {
                $rootScope.$watch('profile', function (newValue, oldValue) {
                    if (newValue) {
                        if (!data) {
                            data = {};
                        }

                        data.mobile = newValue.mobile;
                    }

                    tracking.sendX(eventName, data);
                });
            }
        };
    }])
    .controller('headerCtrl', ['$scope', '$rootScope', 'api', 'clientConfig', function ($scope, $rootScope, api, clientConfig) {
        $scope.isActive = function (link) {
            return location.pathname === link;
        };

        if (typeof $ !== 'undefined') {
            $(function () {
                angular.element(document).ready(function () {
                    $('.ui.dropdown.item')
                        .dropdown({
                            on: 'hover'
                        });
                })
            });
        }
    }])
    .value('GenderDisplay', {
        U: '未知',
        M: '金童',
        F: '玉女'
    })
    .factory('modalFactory', ['$timeout', function ($timeout) {
        return {
            bootstrap: function ($scope, $rootScope, modalId) {
                $scope.showModal = false;
                $scope.hideModal = false;

                $scope.hideTheModal = function () {
                    $scope.hideModal = true;
                    $scope.showModal = false;
                };

                $scope.keepModal = function ($event) {
                    $event.stopPropagation();
                };

                $scope.showTheModal = function () {
                    $scope.showModal = true;
                    $scope.hideModal = false;
                };

                var destroy = $rootScope.$on('modal:show' + modalId, function () {
                    $timeout(function () {
                        $scope.hideModal = false;
                        $scope.showModal = true;
                    });
                });

                var destroy2 = $rootScope.$on('modal:hide', $scope.hideTheModal);

                $scope.$on('$destroy', function () {
                    destroy();
                    destroy2();
                });
            }
        };
    }])
    .factory('levelFactory', ['api', '$q', 'queryParser', 'clientConfig', function (api, $q, queryParser, clientConfig) {
        return {
            getLevel: function () {
                var query = queryParser.parse();
                if (query.level) {
                    return $q.resolve(query.level);
                }

                return api.get(clientConfig.serviceUrls.buzz.profile.currentLevel.frontEnd)
                    .then(function (result) {
                        if (result) {
                            return result.data;
                        }
                    })
                    .catch(function (reason) {
                        return 'B';
                    });
            }
        };
    }])
    .controller('myBuzzCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
        $rootScope.$watch('profile', function (newValue, oldValue) {
            if (newValue) {
                var registerDate = new Date(newValue.regist_date);
                var now = new Date();
                var days = (now - registerDate) / (1000 * 60 * 60 * 24);
                $scope.buzzDays = Math.floor(days + 1);
            }
        });
    }])
// .filter('percentage', ['$window', function ($window) {
//     return function (input, decimals, suffix) {
//         decimals = angular.isNumber(decimals) ? decimals : 3;
//         suffix = suffix || '%';
//         if ($window.isNaN(input)) {
//             return '';
//         }
//         return Math.round(input * Math.pow(10, decimals + 2)) / Math.pow(10, decimals) + suffix
//     };
// }]);
;