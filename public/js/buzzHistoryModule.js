angular.module('buzzHistoryModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule', 'trackingModule'])
    .run(['$rootScope', 'queryParser', 'tracking', function ($rootScope, queryParser, tracking) {
        tracking.sendX('history')
    }])
    .controller('historyCtrl', ['$scope', '$http', 'queryParser', 'service', 'clientConfig', 'httpPaginationData', '$httpParamSerializer', 'tracking', '$rootScope', '$anchorScroll', function ($scope, $http, queryParser, service, clientConfig, httpPaginationData, $httpParamSerializer, tracking, $rootScope, $anchorScroll) {
        var query = queryParser.parse();

        if (!query.level) {
            query.level = 'B';
        }
        if (!query.enabled) {
            query.enabled = true;
        }
        if (!query.date) {
            query.date = {
                end: new Date(2022, 1, 1).toISOString()
            };
        }
        if (query.category) {
            $scope.category = query.category;
        } else {
            $scope.category = '';
            url = clientConfig.serviceUrls.buzz.courses.findByLevel.frontEnd;
        }
        var level = query.level;
        $scope.level = level;
        var url = clientConfig.serviceUrls.buzz.courses.searchFor.frontEnd + '?' + $httpParamSerializer(query);

        function sortByDate(a, b) {
            if (a.date > b.date) {
                return -1;
            }

            if (a.date < b.date) {
                return 1;
            }

            return 0;
        }

        $scope.loading = true;
        $scope.allCourseData = [];
        $scope.more = true;
        $scope.courseData = new httpPaginationData({
            sourceUrl: url,
            pageSize: 7,
            dataField: 'rows',
            dataGotCallback: function (result) {
                if (typeof result.length === 'undefined') {
                    result = result.data;
                }

                $scope.courseList = result.sort(sortByDate);

                if ($scope.courseList.length <= 0) {
                    $scope.more = false;
                }

                $scope.courseList.map(function (c) {
                    $http.get(c.video_path).then(function (result) {
                        c.title = result.data.title;
                        c.baseNumber = result.data.baseNumber || 100;

                        if (result.data.image === 'http://source.bridgeplus.cn/image/png/buzz-poster.png') {
                            c.image = '//resource.buzzbuzzenglish.com/image/png/buzz-poster.png';
                        } else {
                            c.image = result.data.image.replace('http://', '//').replace('https://', '//') || '//resource.buzzbuzzenglish.com/image/png/buzz-poster.png';
                        }

                        return $http.get(clientConfig.serviceUrls.buzz.courseViews.frontEnd.replace(':category', c.category).replace(':level', c.level).replace(':lesson_id', c.lesson_id));
                    }).then(function (result) {
                        c.baseNumber = parseInt(c.baseNumber) + (parseInt(result.data.hits) || 0);
                        return $http.get(clientConfig.serviceUrls.buzz.lessonVisited.count.frontEnd + '?lesson_id=' + c.lesson_id);
                    }).then(function (result) {
                        c.visited_time = 50;
                        if (result && result.data && parseInt(result.data)) {
                            c.visited_time = parseInt(result.data) + parseInt(c.visited_time);
                        }
                        return $http.get(clientConfig.serviceUrls.buzz.lessonGetTags.get.frontEnd + '?lesson_id=' + c.lesson_id);
                    }).then(function (result) {
                        c.tags = [];
                        if (result.data.length !== 0) {
                            for (var i in result.data) {
                                c.tags.push(result.data[i].tag_name);
                            }
                        }
                    });
                });

                $scope.allCourseData = $scope.allCourseData.concat($scope.courseList);
                $scope.loading = false;
            }
        });

        $rootScope.loadMore = function () {
            $scope.courseData.getNextPage();
        };

        $scope.aLikeClick = function (href) {
            window.location.href = href;
        };


        $rootScope.toTop = function () {
            $anchorScroll('top');
        };

        $scope.courseData.getNextPage();
    }])
    .controller('courseCategoryCtrl', ['$scope', '$http', 'clientConfig', 'queryParser', function ($scope, $http, clientConfig, queryParser) {
        $http.get(clientConfig.serviceUrls.buzz.categories.list.frontEnd).then(function (result) {
            $scope.categories = result.data;
        });
    }])
    .controller('memberPaidCourseCtrl', ['$scope', '$http', 'clientConfig', 'queryParser', '$anchorScroll', '$rootScope', function ($scope, $http, clientConfig, queryParser, $anchorScroll, $rootScope) {
        $scope.loading = true;
        $http.get(clientConfig.serviceUrls.buzz.memberPaidCourse.get.frontEnd).then(function (result) {
            if (result.data && result.data.length !== 0) {
                function sortByDate(a, b) {
                    if (a.date > b.date) {
                        return -1;
                    }

                    if (a.date < b.date) {
                        return 1;
                    }

                    return 0;
                }

                $scope.coursePaidList = result.data.sort(sortByDate);

                $scope.coursePaidList.map(function (c) {
                    $http.get(c.video_path).then(function (result) {
                        c.title = result.data.title;
                        c.baseNumber = result.data.baseNumber || 100;
                        c.image = result.data.image || '//resource.buzzbuzzenglish.com/image/png/buzz-poster.png';

                        return $http.get(clientConfig.serviceUrls.buzz.courseViews.frontEnd.replace(':category', c.category).replace(':level', c.level).replace(':lesson_id', c.lesson_id));
                    }).then(function (result) {
                        c.baseNumber = parseInt(c.baseNumber) + (parseInt(result.data.hits) || 0);
                        return $http.get(clientConfig.serviceUrls.buzz.lessonVisited.count.frontEnd + '?lesson_id=' + c.lesson_id);
                    }).then(function (result) {
                        c.visited_time = 50;
                        if (result && result.data && parseInt(result.data)) {
                            c.visited_time = parseInt(result.data) + parseInt(c.visited_time);
                        }
                        return $http.get(clientConfig.serviceUrls.buzz.lessonGetTags.get.frontEnd + '?lesson_id=' + c.lesson_id);
                    }).then(function (result) {
                        c.tags = [];
                        if (result.data.length !== 0) {
                            for (var i in result.data) {
                                c.tags.push(result.data[i].tag_name);
                            }
                        }
                    });
                });

                $scope.loading = false;

            } else {
                $scope.coursePaidList = [];

                $scope.loading = false;
            }
        });

        $scope.aLikeClick = function (href) {
            window.location.href = href;
        };

        $rootScope.toTop = function () {
            $anchorScroll('top');
        };

    }])
    .controller('userAccountCtrl', ['$scope', '$http', 'clientConfig', 'queryParser', function ($scope, $http, clientConfig, queryParser) {
        $scope.account = "0.00";
        $http.get(clientConfig.serviceUrls.buzz.userAccount.get.frontEnd).then(function (result) {
            $scope.account = parseFloat(result.data.account).toFixed(2);
        });
    }]);