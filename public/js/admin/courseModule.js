angular.module('courseModule', ['servicesModule', 'clientConfigModule', 'angularQueryParserModule'])
    .controller('courseAddCtrl', ['$scope', 'service', 'clientConfig', '$q', function ($scope, service, clientConfig, $q) {
        $scope.courseData = {
            date: '',
            category: 'SCIENCE',
            level: null,
            enabled: true,
            title: null,
            description: null,
            subtitle: null,
            newWords: null,
            quizzes: null,
            image: 'http://source.bridgeplus.cn/image/png/buzz-poster.png',
            baseNumber: 100,
            switch: [{
                src: null,
                title: null,
                image: null,
                default: false
            }]
        };

        $scope.removeSwitchItem = function (item) {
            $scope.courseData.switch = $scope.courseData.switch.filter(function (i) {
                return i !== item;
            });
        };

        $scope.addSwitchItem = function () {
            $scope.courseData.switch.push({
                src: null,
                title: null,
                image: null,
                default: false
            });
        };

        $scope.saveCourse = function () {
            if ($scope.view === 'json') {
                switchToFormView();
            }

            service.put(clientConfig.serviceUrls.buzz.admin.course.frontEnd, $scope.courseData)
                .then(function (result) {
                    $scope.info = '保存成功';
                }, function (reason) {
                    $scope.errorMessage = reason;
                })
            ;
        };

        $scope.view = 'json';

        function switchToFormView() {
            try {
                syncJsonToForm();

                $scope.view = 'form';
            } catch (ex) {
                alert(ex);
            }
        }

        function switchToJsonView() {
            $scope.view = 'json';
            syncFormToJson();
        }

        $scope.switchView = function () {
            if ($scope.view === 'json') {
                switchToFormView();
            } else {
                switchToJsonView();
            }
        };

        function syncJsonToForm() {
            $scope.courseData = JSON.parse($scope.courseJson);
        }

        function syncFormToJson() {
            $scope.courseJson = JSON.stringify($scope.courseData, null, 4);
        }

        var myTextArea = document.getElementById('json');

        function initCodeMirror() {
            var myCodeMirror = CodeMirror(function (element) {
                myTextArea.parentNode.replaceChild(element, myTextArea);
            }, {
                value: $scope.courseJson,
                mode: 'javascript',
                lineWrapping: true,
                autofocus: true,
                lineNumbers: true,
                viewportMargin: Infinity
            });
        }

        function checkSmil() {
            console.log('got smil = ', $scope.smil_id);
            if (!$scope.smil_id) {
                console.log('no smil');
                return $q.resolve();
            } else {
                return service.get(clientConfig.serviceUrls.buzz.admin.course.frontEnd + '/' + $scope.smil_id).then(function (result) {
                    $scope.courseData = {
                        smil_id: result.smil_id,
                        date: result.date,
                        category: result.category,
                        level: result.level,
                        enabled: result.enabled,
                        title: result.title,
                        description: result.description,
                        subtitle: result.subtitle,
                        newWords: result.newwords,
                        quizzes: result.quizzes,
                        image: result.image,
                        baseNumber: result.basenumber,
                        switch: result.switch
                    };
                });
            }
        }

        angular.element(document).ready(function () {
            checkSmil().then(function () {
                syncFormToJson();
                initCodeMirror();
            });
        });
    }])
;