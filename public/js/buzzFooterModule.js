angular.module('buzzFooterModule', [])
    .controller('footerCtrl', ['$scope', function ($scope) {
        $scope.isActive = function (href) {
            return location.pathname === href
        }
    }])