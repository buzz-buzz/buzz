angular.module('buzzModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule', 'buzzHeaderModule', 'quizModule', 'serviceCacheModule', 'wechatShareModule', 'parserModule', 'DateModule'])
    .run(['$rootScope', 'trackingX', 'queryParser', '$timeout', function($rootScope, tracking, queryParser, $timeout) {
        var query = queryParser.parse();
        tracking.sendX('play', {
            date: query.date,
            category: query.cat,
            level: query.level,
            trk_tag: query.trk_tag
        });

        var parse = function(originData) {
            var retData = {};

            if (originData) {
                switch (originData.type) {
                    case 'ispring':
                        retData.mark = originData.AWARDED_SCORE;
                        retData.status = originData.QUIZ_STATUS;
                        retData.title = originData.QUIZ_TITLE;
                        break;
                }
            }

            return retData;
        };

        window.addEventListener("message", function(event) {
            if (event.data.type && event.data.type === 'ispring') {
                var type = '';
                switch ($rootScope.tabularIndex) {
                    case 1:
                        type = 'vocabulary';
                        break;
                    case 2:
                        type = 'daily-exercise';
                        break;
                    case 3:
                        type = 'weekly-quiz';
                        break;
                    default:
                        break;
                }

                $rootScope.$emit('answer:' + type, parse(event.data));
            }
        });

        if (query.trk_tag) {
            sessionStorage.setItem('trk_tag', query.trk_tag);
        }

        $timeout(function() {
            var isShow = localStorage.getItem('newFucTag');
            if (!isShow) {
                if (document.getElementById("dimmer-once")) {
                    document.getElementById("dimmer-once").style.display = "block";
                    document.getElementById("dimmer-once").style.opacity = 1;
                }
            }
        }, 2000);

    }])
    .controller('VideoPlayerCtrl', ['$scope', '$sce', 'clientConfig', '$http', 'queryParser', '$rootScope', function($scope, $sce, clientConfig, $http, queryParser, $rootScope) {
        $scope.loading = true;

        function getLesson() {
            var query = queryParser.parse();

            return $http.get(clientConfig.serviceUrls.buzz.courses.findByDate.frontEnd.replace(':category', query.cat).replace(':level', query.level).replace(':date', query.date).replace(':lesson_id?', query.lesson_id || ''));
        }

        getLesson()
            .then(function(result) {
                $scope.queryString = location.search + '&video_path=' + (result.data.video_path) + '&new_words_path=' + result.data.new_words_path + '&lesson_id=' + result.data.lesson_id;

                $scope.src = '/s/player' + $scope.queryString;
                $scope.loading = false;

                $rootScope.lessonInfo = {
                    video_path: result.data.video_path,
                    quiz_path: result.data.quiz_path,
                    new_words_path: result.data.new_words_path,
                    lesson_id: result.data.lesson_id,
                    enabled: result.data.enabled,
                    tags: result.data.tags
                };

                $scope.$emit('lessonInfo:got', $rootScope.lessonInfo);
            });
        $scope.$sce = $sce;
    }])
    .controller('UpdateHitsCtrl', ['$scope', 'clientConfig', '$http', function($scope, clientConfig, $http) {
        window.addEventListener('message', function(event) {
            if (event.origin === location.origin && (typeof event.data === 'string') && event.data.indexOf('video:played//') === 0) {
                try {
                    var data = JSON.parse(event.data.substr(14));
                    $http
                        .post(clientConfig.serviceUrls.buzz.courseViews.frontEnd.replace(':category', data.category).replace(':level', data.level).replace(':lesson_id', data.lesson_id), {});
                    $http.post(clientConfig.serviceUrls.buzz.memberCourse.save.frontEnd, {
                        lesson_id: data.lesson_id
                    });
                } catch (ex) {
                    console.error(ex);
                }
            }

            if (event.origin === location.origin && (typeof event.data === 'string') && event.data.indexOf('video:eightyPercentPlayed//') === 0) {
                try {
                    var data = JSON.parse(event.data.substr(27));
                    console.log("send 80% to :" + data.lesson_id);
                    $http.post(clientConfig.serviceUrls.buzz.lessonVisited.save.frontEnd + '?lesson_id=' + data.lesson_id, {});
                } catch (ex) {
                    console.error(ex);
                }
            }
        }, false);
    }])
    .controller('page2ParentCtrl', ['$scope', 'trackingX', 'queryParser', function($scope, tracking, queryParser) {
        $scope.$root.tabularIndex = 0;
        //如果是PC端  初始值为1
        if (!navigator.userAgent.match(/(iPhone|iPod|Android|ios|Windows Phone)/i)) {
            $scope.$root.tabularIndex = Number(queryParser.get('tab')) || 1;
        }

        $scope.$watch('tabularIndex', function(newVal, oldVal) {
            switch (newVal) {
                case 1:
                    tracking.sendX('play.vocabularyTab.click');
                    break;
                case 2:
                    tracking.sendX('play.exerciseTab.click');
                    break;
                case 3:
                    tracking.sendX('play.quizTab.click');
                    break;
                default:
                    break;
            }
        });

        $scope.switchToTab = function(index) {
            if ($scope.$root.tabularIndex === index) {
                $scope.$root.tabularIndex = 0;
            } else {
                $scope.$root.tabularIndex = index;
                if (index === 1) {
                    location.href = '/my/today-vocabulary' + location.search;
                }
                if (index === 2) {
                    location.href = '/my/daily-exercise' + location.search;
                }
                if (index === 3) {
                    location.href = '/my/weekly-quiz' + location.search;
                }
            }
        };
    }])

.controller('loginModalCtrl', ['$scope', 'modalFactory', '$rootScope', function($scope, modalFactory, $rootScope) {
        var modalId = '#login';
        modalFactory.bootstrap($scope, $rootScope, modalId);
        window.addEventListener('message', function(event) {
            if (event.origin === location.origin && (typeof event.data === 'string') && event.data.indexOf('video:restricted//') === 0) {
                try {
                    $rootScope.$emit('modal:show' + modalId);
                } catch (ex) {
                    console.error(ex);
                }
            }
        }, false);
    }])
    .controller('auditModalCtrl', ['$scope', '$rootScope', 'modalFactory', function($scope, $rootScope, modalFactory) {
        modalFactory.bootstrap($scope, $rootScope, '#audit-modal');

        $rootScope.$watch('lessonInfo', function(newValue, oldValue) {
            if (newValue && !newValue.enabled) {
                $scope.showTheModal();
            }
        });
    }])
    .controller('payingModalCtrl', ['$scope', '$rootScope', 'modalFactory', '$q', function($scope, $rootScope, modalFactory, $q) {
        modalFactory.bootstrap($scope, $rootScope, '#paying-modal');

        var lessonInfoDfd = $q.defer();
        var profileDfd = $q.defer();
        $rootScope.$watch('lessonInfo', function(newValue, oldValue) {
            if (newValue) {
                lessonInfoDfd.resolve(newValue);
            }
        });

        $rootScope.$watch('profile.tags', function(newValue, oldValue) {
            if (newValue) {
                profileDfd.resolve(newValue);
            }
        });

        $q.all([lessonInfoDfd.promise.then(), profileDfd.promise.then()]).then(function(results) {
            var lessonInfo = results[0];
            var profileTags = results[1];

            if ((lessonInfo.tags && lessonInfo.tags.length) && (!profileTags || !profileTags.length || (
                    lessonInfo.tags.filter(function(lt) {
                        return profileTags.indexOf(lt) >= 0;
                    }).length <= 0 &&
                    profileTags.filter(function(pt) {
                        return lessonInfo.tags.indexOf(pt) >= 0;
                    }).length <= 0
                ))) {
                $scope.showTheModal();
            }
        });
    }]);