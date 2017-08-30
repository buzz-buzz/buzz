angular.module('accountModule', ['clientConfigModule', 'buzzHeaderModule', 'educationModule', 'servicesModule', 'errorParserModule', 'formModule', 'angular-file-reader', 'wechatShareModule'])
    .run(['queryParser', function(queryParser) {
        if (queryParser.get('trk_tag')) {
            sessionStorage.setItem('trk_tag', queryParser.get('trk_tag'));
        }
    }])
    .config(['$translateProvider', function($translateProvider) {
        $translateProvider.useSanitizeValueStrategy(null);
        $translateProvider.translations('en', {}).translations('zh', {
            'missing validation code': '图形验证码不正确',
            'validate not pass': '图形验证码未通过，请重新输入',
            "Password can't be empty": '密码不能为空',
            'Identity already existed': '该手机号已注册',
            'sms validate error': '短信验证码不正确',
            'Invalid mobile': '手机号码不正确或者暂未被支持'
        });
        $translateProvider.preferredLanguage('zh');
    }])
    .controller('viewAccountCtrl', ['$http', 'clientConfig', '$rootScope', '$scope', 'GenderDisplay', 'GradeDisplay', 'LevelDisplay', function($http, clientConfig, $rootScope, $scope, GenderDisplay, GradeDisplay, LevelDisplay) {
        $scope.expanded = false;
        $scope.expand = function(val) {
            $scope.expanded = val;
        };
        $rootScope.$watch('profile', function(newValue, oldValue) {
            if (newValue) {
                $scope.displayGender = GenderDisplay[newValue.gender];
            }
        });

        $http.get(clientConfig.serviceUrls.buzz.profile.latestAllEducation.frontEnd)
            .then(function(result) {
                $scope.info = {
                    grade: result.data.grade,
                    displayGrade: GradeDisplay[result.data.grade],
                    topics: result.data.fav_topics,
                    level: LevelDisplay[result.data.fav_level]
                };
            });

        $scope.showModal = function(id) {
            $rootScope.$emit('modal:show' + id);
        };

        $scope.mobileChangeAvatar = function() {
            location.href = '/my/avatar';
            event.stopPropagation();
        };

        $scope.showPaidCourse = function() {
            location.href = '/my/paid-course';
            event.stopPropagation();
        };

        $scope.showMyVideoList = function () {
            location.href = '/video-list';
            event.stopPropagation();
        };

        $scope.showUserAccount = function() {
            location.href = '/my/user-account';
            event.stopPropagation();
        };

        $rootScope.$on('info:updated', function(event, data) {
            if (data.grade) {
                $scope.info.grade = data.grade;
                $scope.info.displayGrade = GradeDisplay[data.grade];
            }

            if (data.gender) {
                $scope.displayGender = GenderDisplay[data.gender];
            }

            if (data.name) {
                $rootScope.profile.real_name = data.name;
            }

            if (data.topics) {
                $scope.info.topics = [data.topics];
            }

            if (data.level) {
                $scope.info.level = LevelDisplay[data.level];
            }

            if (data.mobile) {
                $rootScope.profile.mobile = data.mobile;
            }

            if (data.avatar) {
                $rootScope.profile.avatar = data.avatar;
            }
        });
    }])
    .controller('qrCodeCtrl', ['$scope', '$rootScope', 'buzzApi', function($scope, $rootScope, buzzApi) {
        var modalId = '#qr-code';
        $scope.showDetail = function() {
            $rootScope.$emit('modal:show' + modalId);
        };
        $rootScope.$watch('profile', function(newValue, oldValue) {
            if (newValue) {
                buzzApi.getMySharingQrCode(newValue.invite_code, '300x300');
            }
        });
    }])
    .controller('qrCodeModalCtrl', ['$scope', '$rootScope', 'modalFactory', 'buzzApi', function($scope, $rootScope, modalFactory, buzzApi) {
        modalFactory.bootstrap($scope, $rootScope, '#qr-code');
        $rootScope.$watch('profile', function(newValue, oldValue) {
            if (newValue) {
                buzzApi.getMyShareLink(newValue.invite_code).then(function(link) {
                    $scope.myShareLink = link;
                });

                buzzApi.getMySharingQrCode(newValue.invite_code, '300x300', $rootScope.profile.invite_code).then(function(link) {
                    $scope.qrCodeLink = link;
                });
            }
        });
    }])
    .controller('infoFormParentCtrl', ['$scope', '$rootScope', 'modalFactory', function($scope, $rootScope, modalFactory) {
        $scope.step = 2;

        modalFactory.bootstrap($scope, $rootScope, '');

    }])
    .controller('mobileModalCtrl', ['$scope', '$rootScope', 'modalFactory', function($scope, $rootScope, modalFactory) {
        modalFactory.bootstrap($scope, $rootScope, '#mobile');
    }])
    .controller('infoCtrl', ['$http', 'clientConfig', '$scope', '$rootScope', 'Grades', '$q', 'service', 'serviceErrorParser', '$timeout', function($http, clientConfig, $scope, $rootScope, Grades, $q, service, serviceErrorParser, $timeout) {
        $scope.infoData = {};

        $scope.grades = Grades;

        $http.get(clientConfig.serviceUrls.buzz.categories.list.frontEnd).then(function(result) {
            $scope.topics = result.data.map(function(c) {
                return {
                    key: c.category,
                    name: c.category
                };
            });
        });

        $http.get(clientConfig.serviceUrls.buzz.profile.currentLevel.frontEnd).then(function(result) {
            $scope.infoData.level = result.data;
        });

        $http.get(clientConfig.serviceUrls.buzz.profile.latestAllEducation.frontEnd).then(function(result) {
            if (result.data.fav_topics && result.data.fav_topics.length) {
                $scope.infoData.topics = result.data.fav_topics[0];
                Array.prototype.contains = function(needle) {
                    for (i in this) {
                        if (this[i] == needle) return true;
                    }
                    return false;
                };

                $scope.topicSelect = function(op) {
                    if ($scope.infoData.topics.contains(op)) {
                        $scope.infoData.topics.remove(op);
                    } else {
                        $scope.infoData.topics.push(op);
                    }
                }
            }

            $scope.infoData.level = result.data.fav_level;
        });

        $rootScope.$watch('profile', function(newValue, oldValue) {
            if (newValue) {
                $scope.infoData.name = newValue.real_name;
                $scope.infoData.gender = newValue.gender;
            }
        });

        $scope.$parent.$parent.$watch('info', function(newVal, oldVal) {
            if (newVal) {
                $scope.infoData.grade = newVal.grade;
            }
        });

        $scope.submitInfo = function() {
            $q.all([service.post(clientConfig.serviceUrls.sso.profile.update.frontEnd, {
                    real_name: $scope.infoData.name,
                    gender: $scope.infoData.gender
                }), $http.put(clientConfig.serviceUrls.buzz.profile.education.frontEnd, {
                    grade: '' + $scope.infoData.grade,
                    fav_topics: $scope.infoData.topics ? [$scope.infoData.topics] : [],
                    fav_level: $scope.infoData.level
                })])
                .then(function(result) {
                    $scope.successMessage = '保存成功！';
                    $scope.$emit('info:updated', $scope.infoData);
                    $timeout(function() {
                        $scope.$emit('modal:hide');
                        $scope.successMessage = '';
                    }, 1000);
                })
                .catch(function(error) {
                    $scope.errorMessage = serviceErrorParser.getErrorMessage(error);
                });
        };
    }])
    .controller('mobileInfoCtrl', ['$scope', 'clientConfig', '$q', 'Grades', 'service', '$rootScope', '$http', function($scope, clientConfig, $q, Grades, service, $rootScope, $http) {
        var findGrade = function(val) {
            return Grades.find(function(gradeObj) {
                return gradeObj.key === val || val === gradeObj.name;
            }) || { name: "", key: "" };
        };

        $scope.data = {
            name: $rootScope.profile.real_name,
            gender: $rootScope.profile.gender,
            grade: findGrade($scope.info.grade),
            displayGrade: findGrade($scope.info.grade).name
        };
        $scope.grades = Grades;
        $scope.cancel = function() {
            $scope.data.name = $rootScope.profile.real_name;
            $scope.data.gender = $rootScope.profile.gender;
            $scope.data.grade = findGrade($scope.data.displayGrade);
            $scope.$emit("editDone");
        };
        $scope.updateGender = $scope.updateName = function() {
            return service.post(clientConfig.serviceUrls.sso.profile.update.frontEnd, {
                real_name: $scope.data.name,
                gender: $scope.data.gender
            }).then(function() {
                $rootScope.profile.real_name = $scope.data.name;
                $rootScope.profile.gender = $scope.data.gender;
                $scope.$emit("editDone");
            }).catch(function() {
                //todo
                $scope.$emit("editDone");
            });
        };
        $scope.updateGrade = function() {
            return $http.put(clientConfig.serviceUrls.buzz.profile.education.frontEnd, {
                grade: $scope.data.grade.key.toString()
            }).then(function() {
                $scope.data.displayGrade = $scope.data.grade.name;
                $scope.info.grade = $scope.data.grade.key;
                $scope.$emit("editDone");
            }).catch(function() {
                //todo
                $scope.$emit("editDone");
            });
        };
    }])
    .controller('mobileWidgetCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
        $rootScope.$on("editDone", function() {
            $scope.changeMode(false);
        });
        $scope.editMode = false;
        $scope.changeMode = function(val) {
            if (val) {
                $scope.$emit("editDone");
            }
            $scope.editMode = val;
        };
    }])
    .controller('changeMobileCtrl', ['$scope', function($scope) {
        $scope.step = 1;
    }])
    .controller('signUpCtrl', ['$scope', 'service', 'clientConfig', '$timeout', 'serviceErrorParser', function($scope, service, clientConfig, $timeout, serviceErrorParser) {
        $scope.signUpData = {
            mobile: '',
            verificationCode: '',
            captchaId: '',
            captcha: ''
        };

        $scope.signUp = function() {
            service.post(clientConfig.serviceUrls.sso.profile.changeMobile.frontEnd, $scope.signUpData)
                .then(function(res) {
                    $scope.successMessage = '修改成功！';
                    $scope.errorMessage = null;
                    $scope.$emit('info:updated', $scope.signUpData);
                    $timeout(function() {
                        $scope.$emit('modal:hide');
                        $scope.successMessage = '';
                    }, 1000);
                })
                .catch(function(error) {
                    $scope.errorMessage = serviceErrorParser.getErrorMessage(error);
                    $scope.successMessage = null;
                });
        };
    }])
    .controller('headImgCtrl', ['$scope', '$rootScope', 'modalFactory', '$http', 'clientConfig', 'service', 'requestTransformers', 'api', '$timeout', function($scope, $rootScope, modalFactory, $http, clientConfig, service, requestTransformers, api, $timeout) {
        modalFactory.bootstrap($scope, $rootScope, '#head');

        function uploadImageIfAny() {
            var file = document.querySelector('input[id=choose-image]').files[0];
            var filename = file.name;

            if (filename) {
                return $http.put(clientConfig.serviceUrls.buzz.picture.upload.frontEnd, {
                    file: file,
                    'x:category': 'upload-' + Math.random().toString()
                }, {
                    headers: {
                        'X-Requested-With': undefined,
                        'Content-Type': undefined
                    },
                    transformRequest: requestTransformers.transformToFormData
                });

            } else {
                console.log('失败，数据为空');
            }
        }

        $scope.uploadImg = function(resource) {
            if (resource === 'mobile') {
                $rootScope.profile.errorMessage = '上传中...';
            }
            service.executePromiseAvoidDuplicate($scope, 'loading', function() {
                return uploadImageIfAny()
                    .then(function(pictureResult) {
                        var result = pictureResult.data;

                        if (result) {
                            var infoHeadUrl = '//' + result.host + '/' + result.key + '';
                        }
                        return infoHeadUrl;
                    }).then(function(infoHeadUrl) {
                        var dataToUpdate = { avatar: infoHeadUrl };

                        service.post(clientConfig.serviceUrls.sso.profile.update.frontEnd,
                            dataToUpdate).then(function() {
                            $scope.infoHeadUrl = infoHeadUrl;
                            $scope.$emit('info:updated', dataToUpdate);
                            $scope.$emit("editDone");

                            if (resource === 'pc') {
                                $timeout(function() {
                                    $scope.$emit('modal:hide');
                                    $scope.successMessage = '';
                                }, 1000);
                            }

                            if (resource === 'mobile') {
                                $timeout(function() {
                                    $rootScope.profile.errorMessage = '';
                                    document.getElementById('submitHeadUrl').style.display = 'none';
                                    document.getElementById('preview').style.display = 'none';
                                }, 1500);
                            }

                        }).catch(function() {
                            //todo
                            $scope.$emit("editDone");
                        });
                    });

            });
        }
    }])
    .controller('inCodeCtrl', ['$scope', '$rootScope', 'buzzApi', function($scope, $rootScope, buzzApi) {
        var modalId = '#in-code';
        $scope.showInvite = function() {
            $rootScope.$emit('modal:show' + modalId);
        }
    }])
    .controller('inCodeModalCtrl', ['$scope', '$rootScope', 'modalFactory', 'buzzApi', function($scope, $rootScope, modalFactory, buzzApi) {
        modalFactory.bootstrap($scope, $rootScope, '#in-code');
        $scope.channelData = {
            data: ''
        };
        $scope.crateLink = function() {
            channel = $scope.channelData.data,
                $rootScope.$watch('profile', function(newValue, oldValue) {
                    if (newValue) {
                        buzzApi.getShareLink(newValue.invite_code, channel).then(function(link) {
                            $scope.myShareLink = link;
                        });
                    }
                });
        }

    }])