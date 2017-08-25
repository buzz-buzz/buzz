angular.module('spaModule')
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/video-list', {
                templateUrl: 'video-list.html',
                controller: 'videoListCtrl',
                controllerAs: 'videoListCtrl'
            });
    }])
    .controller('videoListCtrl', ['$scope', '$http', '$rootScope', '$anchorScroll', function ($scope, $http, $rootScope, $anchorScroll) {
        $scope.index = 1;
        $scope.videoLength = 10;
        $scope.more = true;

        function getVideoData(index){
            $http.get('/api/videos/10/' + index).then(function (results) {
                $scope.videos = results.data;
                if($scope.videoLength * $scope.index > results.data.length){
                    $scope.more = false;
                }
            });
        }

        //load more
        $scope.loadMore = function(){
            $scope.index ++;
            getVideoData($scope.index);
        };

        getVideoData($scope.index);

        $rootScope.toTop = function () {
            $anchorScroll('top');
        };
    }]);