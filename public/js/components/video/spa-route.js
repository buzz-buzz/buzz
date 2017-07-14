angular.module('spaModule')
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/video', {
                templateUrl: 'video.html',
                controller: 'videoCtrl',
                controllerAs: 'videoCtrl'
            })
            .when('/video-player/:src', {
                templateUrl: 'video-player.html',
                controller: 'videoPlayerCtrl',
                controllerAs: 'videoPlayerCtrl'
            })
            ;

        $routeProvider.otherwise('/video');
    }])
    .controller('videoCtrl', ['$scope', '$rootScope', '$http', 'requestTransformers', '$location', function ($scope, $rootScope, $http, requestTransformers, $location) {
        $scope.formData = { video: null };

        $scope.uploadVideoToOwnServer = function () {
            var file = document.querySelector('input[id=video-file]').files[0];

            if (file) {
                $http.post('/videos', {
                    file: file
                }, {
                        headers: {
                            'X-Requested-With': undefined,
                            'Content-Type': undefined
                        },
                        transformRequest: requestTransformers.transformToFormData
                    }
                ).then(function (res) {
                    $location.path('/video-player/' + encodeURIComponent(res.data));
                });
            }
        };

        $scope.uploadVideo = function () {
            var file = document.querySelector('input[id=video-file]').files[0];

            if (file) {
                $http.put('/videos', {
                    file: file,
                    'x:category': 'upload-' + Math.random().toString()
                }, {
                        headers: {
                            'X-Requested-With': undefined,
                            'Content-Type': undefined
                        },
                        transformRequest: requestTransformers.transformToFormData
                    }).then(function (res) {
                        console.log(res);
                        $location.path('/video-player/' + encodeURIComponent('http://resource.buzzbuzzenglish.com/' + res.data.key));
                    }).catch(function (reason) {
                        console.log(reason);
                        alert(reason.data);
                    });
            } else {
                console.log('empty file');
            }
        };
    }])
    .controller('videoPlayerCtrl', ['$scope', '$routeParams', function ($scope, $routeParams) {
        $scope.videoSrc = decodeURIComponent($routeParams.src);
        $scope.url = location.href;
    }])
    ;
