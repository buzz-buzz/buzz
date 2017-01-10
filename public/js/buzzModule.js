angular.module('buzzModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule', 'buzzHeaderModule'])
    .run(['$rootScope', 'tracking', 'queryParser', function ($rootScope, tracking, queryParser) {
        var query = queryParser.parse();

        tracking.send('play', {
            date: query.date,
            category: query.cat,
            level: query.level
        });
    }])
    .controller('VideoPlayerCtrl', ['$scope', '$sce', 'clientConfig', '$http', 'queryParser', '$rootScope', '$timeout', function ($scope, $sce, clientConfig, $http, queryParser, $rootScope, $timeout) {
        var query = queryParser.parse();
        $http.get(clientConfig.serviceUrls.buzz.courses.findByDate.frontEnd.replace(':category', query.cat).replace(':level', query.level).replace(':date', query.date))
            .then(function (result) {
                $scope.queryString = location.search + '&video_path=' + (result.data.video_path) + '&new_words_path=' + result.data.new_words_path;
                $scope.src = 'player' + $scope.queryString;

                $rootScope.lessonInfo = {
                    video_path: result.data.video_path,
                    quiz_path: result.data.quiz_path,
                    new_words_path: result.data.new_words_path
                };

                $scope.$emit('lessonInfo:got', $rootScope.lessonInfo);

                console.log($rootScope.lessonInfo);
            })
        ;
        $scope.$sce = $sce;
    }])
    .controller('LevelCtrl', ['$scope', 'queryParser', '$httpParamSerializer', function ($scope, queryParser, $httpParamSerializer) {
        var query = queryParser.parse();

        $scope.switchToLevel = function (level) {
            query.level = level;
            location.href = '/my/play?' + $httpParamSerializer(query);
        };

        $scope.switchToLevelFrom = function (currentLevel) {
            var to = currentLevel === 'A' ? 'B' : 'A';
            query.level = to;
            location.href = '/my/play?' + $httpParamSerializer(query);
        };

        $scope.currentLevel = query.level;
    }])
    .controller('page2ParentCtrl', ['$scope', 'tracking', function ($scope, tracking) {
        $scope.$root.tabularIndex = 1;

        $scope.$watch('tabularIndex', function (newVal, oldVal) {
            switch (newVal) {
                case 1:
                    tracking.send('play.vocabularyTab.click');
                    break;
                case 2:
                    tracking.send('play.exerciseTab.click');
                    break;
                case 3:
                    tracking.send('play.quizTab.click');
                    break;
                default:
                    break;
            }
        });
    }])
    .controller('quizCtrl', ['$scope', '$http', 'queryParser', '$sce', '$window', 'clientConfig', '$rootScope', 'tracking', '$timeout', function ($scope, $http, queryParser, $sce, $window, clientConfig, $rootScope, tracking, $timeout) {
        $scope.$sce = $sce;
        $scope.quizURL = "";

        $scope.quizzes = [];
        $scope.quizIndex = 0;
        var STATUS = $scope.STATUS = {
            "U": "unchecked",
            "P": "passed",
            "F": "failed"
        };

        function lessonDataGot(event, data) {
            $scope.currentID = "";
            $scope.initStatus = "";
            $scope.animateDirection = "";
            var getNextId = function() {
                if ($scope.currentID != "quiz-1") {
                    $scope.currentID = "quiz-1";
                } else {
                    $scope.currentID = "quiz-2";
                }
                return $scope.currentID;
            };
            var setUrl = function (forcerefresh) {
                if ($scope.initStatus === "") {
                    $scope.initStatus = "true";
                } else {
                    $scope.initStatus = "false";
                }
                if ($window.quizAdapter) {
                    tracking.send('today-quiz', {
                        index: $scope.quizIndex
                    });
                    $window.quizAdapter.getResult(getNextId(), $scope.quizzes[$scope.quizIndex].url, forcerefresh).then(function (ret) {
                        var status = ret.status;
                        $scope.quizzes[$scope.quizIndex].status = status.toLowerCase();
                        tracking.send('today-quiz.submit', {
                            index: $scope.quizIndex,
                            ispassed: ret.status.toLowerCase() === STATUS.P,
                            score: ret.mark
                        });
                    }, function () {
                        //Do nothing
                    });
                }
            };
            $scope.actionLock = false;
            var doAction = function() {
                var ret = true;
                if ($scope.actionLock) {
                    ret = false;
                } else {
                    $scope.actionLock = true;
                    $timeout(function() {
                        $scope.actionLock = false;
                        $scope.animateDirection = "";
                    }, 1100);
                }
                return ret;
            };

            var smilJson = data.quiz_path;

            $http.get(smilJson).then(function (ret) {
                var data = ret.data;
                var retArray = [];
                Object.keys(data).forEach(function (key) {
                    retArray.push({
                        "name": key,
                        "url": data[key],
                        "status": STATUS.U
                    });
                });
                $scope.quizzes = retArray;

                setUrl(true);

                $scope.itemClick = function (index) {
                    if (!doAction()){
                        return;
                    }
                    if ($scope.quizIndex !== index) {
                        if ($scope.quizIndex > index) {
                            $scope.animateDirection = "ltom";
                        } else {
                            $scope.animateDirection = "rtom";
                        }
                        $scope.quizIndex = index;
                        setUrl(true);
                    }
                };
                $scope.turnQuiz = function (isNext) {
                    if (!doAction()){
                        return;
                    }
                    var maxIndex = $scope.quizzes.length - 1;
                    if (isNext) {
                        $scope.quizIndex++;
                        $scope.animateDirection = "rtom";
                    } else {
                        $scope.quizIndex--;
                        $scope.animateDirection = "ltom";
                    }
                    if ($scope.quizIndex > maxIndex) {
                        $scope.quizIndex = maxIndex;
                    } else if ($scope.quizIndex < 0) {
                        $scope.quizIndex = 0;
                    }
                    // if ($scope.quizIndex===2) {
                    //     $scope.quizzes[$scope.quizIndex].status=STATUS.P;
                    // }
                    // if ($scope.quizIndex===3) {
                    //     $scope.quizzes[$scope.quizIndex].status=STATUS.F;
                    // }
                    setUrl(true);
                };
            });
        }

        if ($rootScope.lessonData) {
            lessonDataGot(null, $rootScope.lessonData);
        } else {
            var unbind = $rootScope.$on('lessonInfo:got', lessonDataGot);
            $scope.$on('$destroy', unbind);
        }
    }])
    .controller('newWordCtrl', ['$scope', '$http', 'queryParser', '$timeout', '$sce', '$window', 'tracking', 'clientConfig', '$rootScope', '$timeout', function ($scope, $http, queryParser, $timeout, $sce, $window, tracking, clientConfig, $rootScope, $timeout) {

        $scope.$sce = $sce;
        $scope.newWords = [];
        $scope.word = {};
        var wordIndex = $scope.wordIndex = 0;

        function lessonDataGot(event, lessonData) {
            $scope.currentID = "";
            $scope.initStatus = "";
            $scope.animateDirection = "";
            var getNextId = function() {
                if ($scope.currentID != "word-1") {
                    $scope.currentID = "word-1";
                } else {
                    $scope.currentID = "word-2";
                }
                return $scope.currentID;
            };
            var seturl = function (url, isQuiz, forcerefresh) {
                if ($scope.initStatus === "") {
                    $scope.initStatus = "true";
                } else {
                    $scope.initStatus = "false";
                }
                if ($window.quizAdapter) {
                    var word = $scope.newWords[$scope.wordIndex].word;
                    if (isQuiz) {
                        tracking.send('today-vocabulary-quiz', {
                            word: word
                        });
                    } else {
                        tracking.send('today-vocabulary-word', {
                            word: word
                        });
                    }
                    $window.quizAdapter.getResult(getNextId(), url, forcerefresh).then(function (ret) {
                        var status = ret.status;
                        $scope.newWords[$scope.wordIndex].status = status.toLowerCase();
                        tracking.send('today-vocabulary-quiz.submit', {
                            word: word,
                            ispassed: ret.status.toLowerCase() === STATUS.P,
                            score: ret.mark
                        });
                    }, function () {
                        //Do nothing
                    });
                }
            };
            $scope.actionLock = false;
            var doAction = function() {
                var ret = true;
                if ($scope.actionLock) {
                    ret = false;
                } else {
                    $scope.actionLock = true;
                    $timeout(function() {
                        $scope.actionLock = false;
                        $scope.animateDirection = "";
                    }, 1100);
                }
                return ret;
            };

            var smilJson = lessonData.new_words_path;
            var STATUS = $scope.STATUS = {
                "U": "unchecked",
                "P": "passed",
                "F": "failed"
            };
            $http.get(smilJson).then(function (ret) {
                if (!ret || !ret.data) {
                    return null;
                }
                var wordsData = ret.data;
                if (wordsData.dictionary) {
                    Object.keys(wordsData.dictionary).forEach(function (key) {
                        var thisWord = wordsData.dictionary[key];
                        $scope.newWords.push({
                            "word": key,
                            "id": thisWord.id,
                            "url": thisWord.url,
                            "exercise": thisWord.exercise || "",
                            "status": STATUS.U
                            // "exercise": thisWord.exercise || "http://content.bridgeplus.cn/buzz-quiz/" + query.date + '-' + query.level + "/index.html"
                        });
                    });
                }
                $scope.WORD_MAX_INDEX = $scope.newWords.length - 1;
                if ($scope.newWords[wordIndex].exercise && $scope.newWords[wordIndex].exercise !== "") {
                    $scope.isWordMode = false;
                    if ($scope.newWords[wordIndex].url && $scope.newWords[wordIndex].url !== "") {
                        $scope.hasWordMode = true;
                    } else {
                        $scope.hasWordMode = false;
                    }
                    seturl($scope.newWords[wordIndex].exercise, true, true);
                } else {
                    $scope.isWordMode = true;
                    $scope.hasWordMode = false;
                    seturl($scope.newWords[wordIndex].url, false, true);

                }
            });

            $scope.itemClick = function (index) {
                if (!doAction()){
                    return;
                }
                if ($scope.wordIndex < index) {
                    $scope.animateDirection = "rtom";
                } else if ($scope.wordIndex > index) {
                    $scope.animateDirection = "ltom";
                } else {
                    return;
                }
                $scope.wordIndex = wordIndex = index;
                if ($scope.newWords[wordIndex].exercise && $scope.newWords[wordIndex].exercise !== "") {
                    $scope.isWordMode = false;
                    if ($scope.newWords[wordIndex].url && $scope.newWords[wordIndex].url !== "") {
                        $scope.hasWordMode = true;
                    } else {
                        $scope.hasWordMode = false;
                    }
                    seturl($scope.newWords[wordIndex].exercise, true, true);
                } else {
                    $scope.hasWordMode = false;
                    $scope.isWordMode = true;
                    seturl($scope.newWords[wordIndex].url, false, true);
                }
            };
            $scope.turnWord = function (isNext) {
                if (!doAction()){
                    return;
                }
                if (isNext) {
                    tracking.send('play.vocabularyTab.slideNextBtn.clicked');
                } else {
                    tracking.send('play.vocabularyTab.slidePrevBtn.clicked');
                }

                var length = $scope.newWords.length;
                if (isNext) {
                    ++wordIndex;
                    $scope.animateDirection = "rtom";
                } else {
                    --wordIndex;
                    $scope.animateDirection = "ltom";
                }
                if (wordIndex >= length) {
                    wordIndex = length - 1;
                } else if (wordIndex < 0) {
                    wordIndex = 0;
                }
                $scope.wordIndex = wordIndex;
                if ($scope.newWords[wordIndex].exercise && $scope.newWords[wordIndex].exercise !== "") {
                    $scope.isWordMode = false;
                    if ($scope.newWords[wordIndex].url && $scope.newWords[wordIndex].url !== "") {
                        $scope.hasWordMode = true;
                    } else {
                        $scope.hasWordMode = false;
                    }
                    seturl($scope.newWords[wordIndex].exercise, true, true);
                } else {
                    $scope.hasWordMode = false;
                    $scope.isWordMode = true;
                    seturl($scope.newWords[wordIndex].url, false, true);
                }
                // $scope.wordURL = $sce.trustAsResourceUrl(newWords[wordIndex].url);
            };
            $scope.changeWordMode = function (value) {
                if (!doAction()){
                    return;
                }
                $scope.isWordMode = value;
                if (value) {
                    seturl($scope.newWords[wordIndex].url, false, false);
                    $scope.animateDirection = "btom";
                } else {
                    seturl($scope.newWords[wordIndex].exercise, true, false);
                    $scope.animateDirection = "ttom";
                }
            };
        }

        if ($rootScope.lessonData) {
            lessonDataGot(null, $rootScope.lessonData);
        } else {
            var unbind = $rootScope.$on('lessonInfo:got', lessonDataGot);
            $scope.$on('$destroy', unbind);
        }

    }])
;
