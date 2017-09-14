'use strict'

describe('videoCtrl', function () {
    var $scope = {
        $watch: function () {}
    };
    beforeEach(angular.mock.module('spaModule'));
    beforeEach(inject(function (_$controller_) {
        _$controller_('videoCtrl', {
            $scope: $scope
        });

        $scope.formData = {
            video: null,
            subtitle: ''
        };
        $scope.dialogueList = ['a', 'b', 'c', 'd', 'e'];

        $scope.dialogueIndex = 0;
    }));

    describe('previous', function () {
        it('should allow dialogue be navigated to previous one', function () {
            $scope.dialogueIndex = 2;

            $scope.previous();

            expect($scope.formData.subtitle).toBe('b');
        })
    })
    describe('next', function () {
        it('should allow dialogue be navigated to next one', function () {
            $scope.dialogueIndex = 1;

            $scope.next();

            expect($scope.formData.subtitle).toBe('c');
        })
    })
    describe('changeDialogue', function () {
        it('swaps dialougue list', function () {
            var beforeSwap = angular.extend([], $scope.dialogueList);
            $scope.changeDialogue($scope.dialogueList);
            var afterSwap = angular.extend([], $scope.dialogueList);
            expect(beforeSwap).not.toEqual(afterSwap);
        });

        it('swaps dialougue list several times', function(){
            var beforeSwap = angular.extend([], $scope.dialogueList);
            $scope.changeDialogue($scope.dialogueList);
            $scope.changeDialogue($scope.dialogueList);
            var afterSwap = angular.extend([], $scope.dialogueList);
            expect(beforeSwap).not.toEqual(afterSwap);
        })
    })
})