'use strict'

describe('videoCtrl', function () {
    var $controller;
    beforeEach(angular.mock.module('spaModule'));
    beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
    }));
    describe('previous', function () {
        it('b should equal a ', function () {
            var $scope = {
                $watch: function () {}
            };
            var controller = $controller('videoCtrl', {
                $scope: $scope
            });
            $scope.formData = {
                video: null,
                subtitle: ''
            };
            $scope.dialogueList = ['a', 'b', 'c', 'd', 'e'];
            $scope.dialogueIndex = $scope.dialogueList.index;
            $scope.dialogueIndex = 2;

            $scope.previous();

            expect($scope.formData.subtitle).toBe('b');
        })
    })
    describe('next', function () {
        it('b should equal c ', function () {
            var $scope = {
                $watch: function () {}
            };
            var controller = $controller('videoCtrl', {
                $scope: $scope
            });
            $scope.formData = {
                video: null,
                subtitle: ''
            };
            $scope.dialogueList = ['a', 'b', 'c', 'd', 'e'];
            $scope.dialogueIndex = $scope.dialogueList.index;
            $scope.dialogueIndex = 1;

            $scope.next();

            expect($scope.formData.subtitle).toBe('c');
        })
    })
    describe('changeDialogue', function () {
        it('b should equal c ', function () {
            var $scope = {
                $watch: function () {}
            };
            var controller = $controller('videoCtrl', {
                $scope: $scope
            });
            $scope.formData = {
                video: null,
                subtitle: ''
            };
            $scope.dialogueList = ['a', 'b', 'c', 'd', 'e'];
            $scope.dialogueIndex = Math.floor(Math.random() * $scope.dialogueList.length);

            $scope.changeDialogue();

            expect($scope.formData.subtitle).toBe($scope.dialogueList[$scope.dialogueIndex]);
        })
    })
})