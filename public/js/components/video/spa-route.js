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
    .run([function () {
        jwplayer.key = 'lG24bAGJCRLF1gi4kajg4EnUKi+ujyUyKMoSNA==';
    }])
    .run(['$rootScope', '$location', 'routerHelper', function ($rootScope, $location, routerHelper) {
        $rootScope.$on('$routeChangeSuccess', function (ev, current, previous) {
            $rootScope.back = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                if (previous && history) {
                    history.back();
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

        function saveUrl(url) {
            api.get('/service-proxy/buzz/video/save/path/' + url).then(function (res) {
                console.log(res.data);
            });
        }

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
                    var backUrl = encodeURIComponent(res.data);
                    //bta(res.data) 返回的url，保存在数据库中
                    saveUrl(btoa(backUrl));
                    //回传video_path_id 作为参数，传递过去
                    $location.path('/video-preview/' + backUrl);
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

        //PC端在使用
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
                        var backUrl = encodeURIComponent('//' + res.data.host + '/' + res.data.key);
                        //bta(res.data) 返回的url，保存在数据库中
                        //saveUrl(btoa(backUrl));
                        $location.path('/video-player/' + backUrl);
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

        $scope.loading = true;
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
            })
            .finally(function () {
                $scope.loading = false;
            });
    }])
    .controller('videoPreviewCtrl', ['$scope', '$routeParams', '$http', 'subTitleParser', '$rootScope', '$location', 'requestTransformers', '$timeout', 'videoStatus', function ($scope, $routeParams, $http, subTitleParser, $rootScope, $location, requestTransformers, $timeout, videoStatus) {
        $scope.videoStatus = {
            description: '',
            raw: decodeURIComponent($routeParams.src)
        };
        $scope.$watch('errorMessage', function (newValue, oldValue) {
            if (newValue) {
                $timeout(function () {
                    $scope.errorMessage = '';
                }, 2000)
            }
        });

        angular.element(document).ready(function () {
            $scope.$broadcast('//video-info:got', $scope.videoStatus);
        });

        $scope.tryAgain = function () {
            $location.path('/video');
        };

        $scope.sureUpload = function () {
            $location.path('/video-player/' + btoa(encodeURIComponent(decodeURIComponent($routeParams.src))));
        };
    }])
    .controller('videoPlayerCtrl', ['$scope', '$routeParams', '$rootScope', '$http', 'clientConfig', '$timeout', 'api', 'videoStatus', '$location', '$sce', '$timeout', function ($scope, $routeParams, $rootScope, $http, clientConfig, $timeout, api, videoStatus, $location, $sce, $timeout) {
        $scope.hideVideo = false;

        function showProcessing() {
            $('#dimmer-processing').dimmer('show');
            $scope.hideVideo = true;
        }

        function hideProcessing() {
            $('#dimmer-processing').dimmer('hide');
            $scope.hideVideo = false;
        }

        function showError() {
            $('#dimmer-error').dimmer('show');
            $scope.hideVideo = true;
        }

        function hideError() {
            $('#dimmer-error').dimmer('hide');
            $scope.hideVideo = false;
        }

        function showGoodScoreDimmer() {
            $timeout(function () {
                $('#dimmer-good-score').dimmer('show');
                $scope.hideVideo = true;
            }, 100);
        }

        function hideGoodScoreDimmer() {
            $('#dimmer-good-score').dimmer('toggle').dimmer('hide');
            $scope.hideVideo = false;
        }

        function showBadScoreDimmer() {
            $('#dimmer-bad-score').dimmer({
                closable: true
            }).dimmer('show');
            $scope.hideVideo = true;
        }

        function getVideoStatus() {
            $scope.loading = true;
            videoStatus.get(atob($routeParams.src)).then(function (status) {
                hideProcessing();
                hideError();
                $scope.videoStatus = status;
                $scope.$broadcast('//video-info:got', status);
                if ($scope.videoStatus.score && parseFloat($scope.videoStatus.score)) {
                    $scope.videoStatus.score = parseInt(parseFloat($scope.videoStatus.score) * 100);
                    if ($scope.videoStatus.score > 30) {
                        showGoodScoreDimmer();
                        ////service-proxy/buzz/video/status/:member_id/:video_id/:status
                        //todo：调用api 修改视频状态为 3 处理完成，待审核
                    } else {
                        showBadScoreDimmer();
                        ////service-proxy/buzz/video/status/:member_id/:video_id/:status
                        //todo：调用api 修改视频状态为 0 offline,下线
                    }
                }
                hideProcessing();
                hideError();
            }).catch(function (reason) {
                if (reason === 'processing') {
                    showProcessing();

                    $timeout(function () {
                        getVideoStatus();
                    }, 15000);
                } else {
                    showError();
                }
            }).finally(function () {
                $scope.loading = false;
            });

        }

        $scope.closeVideoGrade = function () {
            if ($scope.videoStatus.score > 30) {
                hideGoodScoreDimmer();
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

        getVideoStatus();

        $scope.refreshStatus = getVideoStatus;
        $scope.$watch('hideVideo', function (newVal, oldVal) {
            if (newVal) {
                document.getElementById('video-uploaded').style.opacity = 0;
            } else {
                document.getElementById('video-uploaded').style.opacity = 1;
            }
        });
    }])
    .controller('videoShareCtrl', ['$scope', '$routeParams', '$rootScope', '$http', 'clientConfig', '$timeout', 'api', '$q', function ($scope, $routeParams, $rootScope, $http, clientConfig, $timeout, api, $q) {
        $scope.closeDimmer = function () {
            document.getElementById('video-uploaded').style.opacity = '1';
            $('#dimmer-video')
                .dimmer('hide');
        };


        //share to friends
        var sharable = {
            title: '邀请你看TA的自拍秀',
            desc: '我在Buzzbuzz自拍了英语视频，快来看看吧',
            link: location.href.replace('video-player', 'video-share'),
            imgUrl: 'https://resource.buzzbuzzenglish.com/new_buzz_logo1.png'
        };

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
                wxReady().then(function () {
                    wx.onMenuShareTimeline(angular.extend({}, sharable, {
                        title: sharable.title + ' ' + sharable.desc
                    }));

                    wx.onMenuShareAppMessage(angular.extend({}, sharable));
                });
            } catch (ex) {
                console.error(ex);
            }
        }

        handleProfile(null, $rootScope.profile);

        function handleProfile(event, profile) {
            if (profile) {
                sharable.link = sharable.link + '?trk_tag=' + profile.invite_code;
                sharable.title = profile.display_name + sharable.title;
            }

            wechatSharable(sharable);
        }

        $rootScope.$on('//profile:got', handleProfile);

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
            $scope.$broadcast('//video-info:got', status);
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
    }])
    .controller('jwPlayerCtrl', ['$scope', '$routeParams', '$http', 'subTitleParser', '$rootScope', '$location', 'requestTransformers', '$timeout', function ($scope, $routeParams, $http, subTitleParser, $rootScope, $location, requestTransformers, $timeout) {
        $scope.$on('//video-info:got', function (event, status) {
            var h = document.querySelector('#video-uploaded').offsetHeight;

            if (h <= 0) {
                h = '164px';
            }

            var options = {
                height: h,
                width: '100%',
                playlist: [{
                    description: status.description,
                    image: '//resource.buzzbuzzenglish.com/image/png/buzz-poster.png',
                    stretching: 'none',
                    sources: [{
                        file: status.raw + '.mp4',
                        image: '//resource.buzzbuzzenglish.com/image/png/buzz-poster.png',
                        label: '原始文件'
                    }]
                }]
            };
            if (status.vtt) {
                options.playlist[0].tracks = [{
                    file: status.vtt,
                    kind: 'subtitles',
                    label: 'English',
                    'default': true
                }];
            }
            if (status.pasteredNose) {
                options.playlist[0].sources.push({
                    file: status.pasteredNose + '.mp4',
                    image: '//resource.buzzbuzzenglish.com/image/png/buzz-poster.png',
                    "default": true,
                    label: '猫须效果'
                });
            }
            if (status.pastered) {
                options.playlist[0].sources.push({
                    file: status.pastered + '.mp4',
                    image: '//resource.buzzbuzzenglish.com/image/png/buzz-poster.png',
                    label: '墨镜效果'
                });
            }
            if (status.cartoonized) {
                options.playlist[0].sources.push({
                    file: status.cartoonized + '.mp4',
                    image: '//resource.buzzbuzzenglish.com/image/png/buzz-poster.png',
                    label: '卡通效果'
                });
            }
            var videoPlayer = jwplayer('video-uploaded').setup(options);
        });

    }]);