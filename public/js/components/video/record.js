angular
    .module('spaModule')
    .controller('videoCtrl', [
        '$scope',
        '$rootScope',
        '$http',
        'requestTransformers',
        '$location',
        '$timeout',
        'api',
        function ($scope, $rootScope, $http, requestTransformers, $location, $timeout, api) {
            $scope.formData = {
                video: null,
                subtitle: '',
                recipes: {
                    recipe_nose: true,
                    recipe_sun_glasses: false,
                    recipe_moustache: false
                }
            };

            $scope.uploadAgainTag = false;
            $scope.changeDialogueTag = false;
            $scope.random = false;
            $scope.uploadVideoToOwnServer = function () {
                var file = document
                    .querySelector('input[id=video-file]')
                    .files[0];

                if (file) {
                    $scope.uploading = true;
                    $http.post('/videos', {
                        file: file,
                        subtitle: $scope.formData.subtitle,
                        recipes: Object
                            .keys($scope.formData.recipes)
                            .filter(function (r) {
                                return !!$scope.formData.recipes[r];
                            })
                    }, {
                        headers: {
                            'X-Requested-With': undefined,
                            'Content-Type': undefined
                        },
                            transformRequest: requestTransformers.transformToFormData
                        })
                        .then(function (res) {
                            if (res.data && res.data.video_id) {
                                $location.path('/video-preview/' + res.data.video_id);
                            } else {
                                $scope.errorMessage = 'buzz-server api error.';
                                $scope.uploadAgainTag = true;
                            }
                        })
                        .catch(function (reason) {
                            $scope.errorMessage = reason.statusText || reason;
                            $scope.uploadAgainTag = true;
                        })
                        . finally(function () {
                            $scope.uploading = false;
                        });
                } else {
                    $scope.errorMessage = 'Please record a video first!';
                }
            };

            $scope.videoChange = function () {
                $scope.uploadVideoToOwnServer();

            };

            $scope.$watch('errorMessage', function (newValue, oldValue) {
                if (newValue) {
                    $timeout(function () {
                        $scope.errorMessage = '';
                    }, 5000)
                }
            });

            $scope.changeDialogue = function (dialogueList) {
                var len = dialogueList.length;
                for (var i = 0; i < len; i++) {
                    var rand = parseInt(Math.random() * len);
                    var temp = dialogueList[rand];
                    dialogueList[rand] = dialogueList[i];
                    dialogueList[i] = temp;
                }
            };

            $scope.loading = true;
            api
                .get('/service-proxy/buzz/video/subtitle-list')
                .then(function (response) {
                    var dialogueList = response.data;
                    $scope.changeDialogue(dialogueList);

                    if (dialogueList.length > 0) {
                        $scope.formData.subtitle = dialogueList[0];
                        $scope.dialogueIndex = 0;
                        $scope.dialogueList = dialogueList;
                    }

                    if (dialogueList.length > 1) {
                        $scope.changeDialogueTag = true;
                    }
                })
                . finally(function () {
                    $scope.loading = false;
                });

            $scope.previous = function () {
                if ($scope.dialogueList) {
                    if ($scope.dialogueIndex > 0) {
                        $scope.dialogueIndex--
                    } else {
                        $scope.dialogueIndex = $scope.dialogueList.length - 1;
                    }
                    $scope.formData.subtitle = $scope.dialogueList[$scope.dialogueIndex];
                }
            };
            $scope.next = function () {
                if ($scope.dialogueList) {
                    if ($scope.dialogueIndex < $scope.dialogueList.length - 1) {
                        $scope.dialogueIndex++;
                    } else {
                        $scope.dialogueIndex = 0;

                    }
                    $scope.formData.subtitle = $scope.dialogueList[$scope.dialogueIndex];
                }
            }
        }
    ])
    .controller('recipesCtrl', [
        '$scope',
        function ($scope) {
            $scope.checkRecipes = function ($event) {
                var checkedRecipes = Object
                    .keys($scope.formData.recipes)
                    .filter(function (r) {
                        return !!$scope.formData.recipes[r];
                    });

                if (checkedRecipes.length < 1) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    // TODO: show message: 至少选择一个特效
                }
            };
        }
    ]);