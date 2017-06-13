angular.module('buzzHistoryModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule', 'trackingModule'])
    .run(['$rootScope', 'queryParser', 'tracking', function ($rootScope, queryParser, tracking) {
        tracking.sendX('history')
    }])
    .controller('historyCtrl', ['$scope', '$http', 'queryParser', 'service', 'clientConfig', 'httpPaginationData', '$httpParamSerializer', 'tracking', function ($scope, $http, queryParser, service, clientConfig, httpPaginationData, $httpParamSerializer, tracking) {
        var query = queryParser.parse();

        if (!query.level) {
            query.level = 'B';
        }
        if (!query.enabled) {
            query.enabled = true;
        }
        if (!query.date) {
            query.date = { end: new Date(2022, 1, 1).toISOString() };
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

        $scope.courseData = new httpPaginationData({
            sourceUrl: url,
            pageSize: 7,
            dataField: 'rows',
            dataGotCallback: function (result) {
                if (typeof result.length === 'undefined') {
                    result = result.data;
                }

                $scope.courseList = result.sort(sortByDate);

                $scope.courseList.map(function (c) {
                    $http.get(c.video_path).then(function (result) {
                        c.title = result.data.title;
                        c.baseNumber = result.data.baseNumber || 100;
                        c.image = result.data.image || 'http://source.bridgeplus.cn/image/png/buzz-poster.png';

                        return $http.get(clientConfig.serviceUrls.buzz.courseViews.frontEnd.replace(':category', c.category).replace(':level', c.level).replace(':lesson_id', c.lesson_id));
                    }).then(function (result) {
                        c.baseNumber = parseInt(c.baseNumber) + (parseInt(result.data.hits) || 0);
                        return $http.get(clientConfig.serviceUrls.buzz.lessonVisited.count.frontEnd + '?lesson_id=' + c.lesson_id);
                    }).then(function(result){
                        if(result && result.data && parseInt(result.data)){
                            c.visited_time = result.data;
                        }
                    });
                });
            }
        });

        $scope.courseData.getNextPage();
        $scope.aLikeClick = function (href) {
            window.location.href = href;
        };
    }])
    .controller('courseCategoryCtrl', ['$scope', '$http', 'clientConfig', 'queryParser', function ($scope, $http, clientConfig, queryParser) {
        $http.get(clientConfig.serviceUrls.buzz.categories.list.frontEnd).then(function (result) {
            $scope.categories = result.data;
        });
    }])
    ;