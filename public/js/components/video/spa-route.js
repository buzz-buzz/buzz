angular.module('spaModule')
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/video', {
                templateUrl: 'video.html',
                controller: 'videoCtrl',
                controllerAs: 'videoCtrl'
            })
            .when('/video-preview/:src', {
                templateUrl: 'video-preview.html',
                controller: 'videoPreviewCtrl',
                controllerAs: 'videoPreviewCtrl'
            })
            .when('/video-player/:src', {
                templateUrl: 'video-player.html',
                controller: 'videoPlayerCtrl',
                controllerAs: 'videoPlayerCtrl'
            })
            .when('/video-share/:src', {
                templateUrl: 'video-share.html',
                controller: 'videoShareFriendCtrl',
                controllerAs: 'videoShareFriendCtrl'
            });

        $routeProvider.otherwise('/video');
    }])
    .run(['$rootScope', '$location', function ($rootScope, $location) {
        function makePath(urlTemplate, args) {
            return urlTemplate.replace(/:[^\/]+/g, function (m, capturedGroup) {
                return args[capturedGroup];
            });
        }

        $rootScope.$on('$routeChangeSuccess', function (ev, current, previous) {
            $rootScope.back = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();

                if (previous) {
                    $location.path(makePath(previous.$$route.originalPath, previous.$$route.params));
                } else {
                    location.href = '/';
                }
            };
        });
    }])
    .factory('videoStatus', ['$http', '$q', '$sce', function ($http, $q, $sce) {
        return {
            get: function (encodedVideoSrc) {
                var decoded = decodeURIComponent(encodedVideoSrc);
                var videoSrc = encodeURIComponent(decoded.replace('/videos/', ''));
                return $http.get('/api/videos/' + videoSrc)
                    .then(function (result) {
                        var status = result.data;
                        //status.score = 0.9;
                        //status.status = 'done';
                        if (status.status !== 'done') {
                            return $q.reject('processing');
                        } else {
                            return $q.resolve(status);
                        }
                    })
                    .catch(function (reason) {
                        return $q.reject(reason);
                    });
            }
        };
    }])
    .controller('videoCtrl', ['$scope', '$rootScope', '$http', 'requestTransformers', '$location', '$timeout', 'api', function ($scope, $rootScope, $http, requestTransformers, $location, $timeout, api) {
        $scope.formData = {
            video: null,
            subtitle: 'I like drawing, and walking in nature'
        };

        $scope.uploadAgainTag = false;
        $scope.changeDialogueTag = false;

        $scope.uploadVideoToOwnServer = function () {
            var file = document.querySelector('input[id=video-file]').files[0];

            if (file) {
                $scope.uploading = true;
                $http.post('/videos', {
                    file: file,
                    subtitle: $scope.formData.subtitle
                }, {
                    headers: {
                        'X-Requested-With': undefined,
                        'Content-Type': undefined
                    },
                    transformRequest: requestTransformers.transformToFormData
                }).then(function (res) {
                    $location.path('/video-preview/' + encodeURIComponent(res.data));
                }).catch(function (reason) {
                    $scope.errorMessage = reason.statusText || reason;
                    $scope.uploadAgainTag = true;
                }).finally(function () {
                    $scope.uploading = false;
                });
            } else {
                $scope.errorMessage = 'Please record a video first!';
            }
        };

        $scope.videoChange = function () {
            $scope.uploadVideoToOwnServer();
        };

        $scope.uploadVideo = function () {
            var file = document.querySelector('input[id=video-file]');

            if (file) {
                file = file.files[0];
            }

            if (!file && recordedBlobs && recordedBlobs.length) {
                file = new Blob(recordedBlobs, {
                    type: 'video/webm'
                });
            }

            if (file) {
                $scope.uploading = true;
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
                    if (res.data.isSuccess === false) {
                        throw res;
                    } else {
                        $location.path('/video-player/' + encodeURIComponent('//' + res.data.host + '/' + res.data.key));
                    }
                }).then(null, function (reason) {
                    console.error(reason);
                    $scope.errorMessage = reason.data || '出了错误。';
                }).finally(function () {
                    $scope.uploading = false;
                });
            } else {
                $scope.errorMessage = 'Please record a video first!';
            }
        };

        $scope.$watch('errorMessage', function (newValue, oldValue) {
            if (newValue) {
                $timeout(function () {
                    $scope.errorMessage = '';
                }, 5000)
            }
        });

        $scope.changeDialogue = function () {
            if ($scope.dialogueList) {
                if ($scope.dialogueIndex < $scope.dialogueList.length - 1) {
                    $scope.dialogueIndex++;
                } else {
                    $scope.dialogueIndex = 0;
                }
                $scope.formData.subtitle = $scope.dialogueList[$scope.dialogueIndex];
            }
        };

        //get new subtitle
        //todo: subtitle server list
        api.get('/service-proxy/buzz/video/subtitle-list')
            .then(function (dialogueList) {
                if (dialogueList.data.length > 0) {
                    $scope.formData.subtitle = dialogueList.data[0];
                    $scope.dialogueIndex = 0;
                    $scope.dialogueList = dialogueList.data;
                }

                if (dialogueList.data.length > 1) {
                    $scope.changeDialogueTag = true;
                }
            });
    }])
    .controller('videoPreviewCtrl', ['$scope', '$routeParams', '$http', 'subTitleParser', '$rootScope', '$location', 'requestTransformers', '$timeout', function ($scope, $routeParams, $http, subTitleParser, $rootScope, $location, requestTransformers, $timeout) {
        $scope.videoSrc = decodeURIComponent($routeParams.src);

        $scope.$watch('errorMessage', function (newValue, oldValue) {
            if (newValue) {
                $timeout(function () {
                    $scope.errorMessage = '';
                }, 2000)
            }
        });

        $scope.tryAgain = function () {
            $location.path('/video');
        };

        $scope.sureUpload = function () {
            $location.path('/video-player/' + btoa(encodeURIComponent($scope.videoSrc)));
        };
    }])
    .controller('videoPlayerCtrl', ['$scope', '$routeParams', '$rootScope', '$http', 'clientConfig', '$timeout', 'api', 'videoStatus', '$location', '$sce', function ($scope, $routeParams, $rootScope, $http, clientConfig, $timeout, api, videoStatus, $location, $sce) {
        $scope.hideVideo = false;

        function showProcessing() {
            $('#dimmer-processing').dimmer('show');
            $scope.hideVideo = true;
        }

        function showError() {
            $('#dimmer-error').dimmer('show');
            $scope.hideVideo = true;
        }

        videoStatus.get(atob($routeParams.src)).then(function (status) {
            $scope.videoStatus = status;
            if ($scope.videoStatus.score && parseFloat($scope.videoStatus.score)) {
                $scope.videoStatus.score = parseInt(parseFloat($scope.videoStatus.score) * 100);
                document.getElementById('video-uploaded').style.opacity = '0';
                $('#dimmer-video-grade').dimmer({
                    closable: false
                }).dimmer('show');
            }
        }).catch(function (reason) {
            if (reason === 'processing') {
                showProcessing();
            } else {
                showError();
            }
        });

        $scope.closeVideoGrade = function () {
            if ($scope.videoStatus.score > 30) {
                $('#dimmer-video-grade').dimmer('hide');
                document.getElementById('video-uploaded').style.opacity = '1';
            } else {
                $location.path('/video');
            }
        };

        $scope.doNothing = function () {
            event.preventDefault();
            console.log('==Default==');
        };

        $scope.shareToFriends = function () {
            document.getElementById('video-uploaded').style.opacity = '0';
            $('#dimmer-video').dimmer({
                closable: false
            }).dimmer('show');
        };

        $scope.gotoVideoRecord = function () {
            $location.path('/video');
        };
    }])
    .controller('videoShareCtrl', ['$scope', '$routeParams', '$rootScope', '$http', 'clientConfig', '$timeout', 'api', '$q', function ($scope, $routeParams, $rootScope, $http, clientConfig, $timeout, api, $q) {
        $scope.closeDimmer = function () {
            document.getElementById('video-uploaded').style.opacity = '1';
            $('#dimmer-video')
                .dimmer('hide');
        };


        //share to friends
        var sharable = {
            title: '我在Buzzbuzz自拍了英语视频，快来看看吧',
            desc: '邀请你看TA的自拍秀',
            link: location.href.replace('video-player', 'video-share'),
            imgUrl: 'https://resource.buzzbuzzenglish.com/wechat-share-friend.jpg'
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
    }])
    .controller('videoShareFriendCtrl', ['$scope', '$routeParams', '$rootScope', '$http', 'clientConfig', '$timeout', 'api', 'videoStatus', '$location', function ($scope, $routeParams, $rootScope, $http, clientConfig, $timeout, api, videoStatus, $location) {
        $scope.hideVideo = false;

        function showProcessing() {
            $('#dimmer-processing').dimmer('show');
            $scope.hideVideo = true;
        }

        function showError() {
            $('#dimmer-error').dimmer('show');
            $scope.hideVideo = true;
        }

        videoStatus.get(atob($routeParams.src)).then(function (status) {
            $scope.videoStatus = status;
            $scope.config = status.videoConfig;
        }).catch(function (reason) {
            if (reason === 'processing') {
                showProcessing();
            } else {
                showError();
            }
        });

        $scope.shareToFriends = function () {
            document.getElementById('video-uploaded').style.opacity = 0;
            $('#dimmer-video').dimmer({
                closable: false
            }).dimmer('show');
        };

        $scope.playVideo = function () {
            $location.path('/video');
        };
    }]);