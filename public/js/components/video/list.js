angular.module('spaModule')
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/video-list', {
                templateUrl: 'video-list.html',
                controller: 'videoListCtrl',
                controllerAs: 'videoListCtrl'
            });
    }])
    .controller('videoListCtrl', ['$scope', '$http', '$rootScope', '$anchorScroll', '$filter', '$location', function ($scope, $http, $rootScope, $anchorScroll, $filter, $location) {
        $scope.index = 1;
        $scope.videoLength = 10;
        $scope.more = true;
        $scope.top = false;
        $scope.videos = [];
        $scope.pageState = '';
        $scope.pageSize = 8;

        function getVideoData(pageSize, pageState) {
            // $http.get('/api/videos/10/' + index).then(function (results) {
            //     $scope.videos = results.data;
            //     if($scope.videoLength * $scope.index > results.data.length){
            //         $scope.more = false;
            //     }
            // });
            $http.get('/service-proxy/buzz/video/path/:page_size/:pageState?'.replace(':page_size', pageSize).replace(':pageState?', pageState))
                .then(function (result) {
                    if (result.data && result.data.rows && result.data.rows.length >= 1) {
                        $scope.videoList = false;
                        for (var i in result.data.rows) {
                            var upload_time = result.data.rows[i].upload_time;
                            result.data.rows[i].upload_time = $filter('date')(upload_time, 'yyyy-MM-dd HH:mm:ss');
                            $scope.videos.push(result.data.rows[i]);
                        }

                    } else {
                        $scope.videoList = true;
                    }
                    if (!result.data.pageState || result.data.rows.length < pageSize) {
                        $scope.more = false;
                    }
                    if ($scope.videos.length > 6) {
                        $scope.top = true;
                    }
                    //保存page_state
                    $scope.pageState = result.data.pageState;
                    $scope.index++;
                });
        }
        //load more
        $scope.loadMore = function () {
            getVideoData($scope.pageSize, $scope.pageState);
        };

        getVideoData($scope.pageSize, $scope.pageState);

        $rootScope.toTop = function () {
            $anchorScroll('top');
        };
        $scope.goToVideo = function () {
            $location.path('/video');
        }
    }]);