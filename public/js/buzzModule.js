angular.module('buzzModule', ['angularQueryParserModule', 'servicesModule', 'clientConfigModule'])
    .run(['$rootScope', 'service', 'clientConfig', function ($rootScope, service, clientConfig) {
        service.get(clientConfig.serviceUrls.sso.profile.load.frontEnd).then(function (result) {
            $rootScope.profile = result;
        });
    }])
    .controller('headerCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
        $rootScope.$watch('profile', function (newValue, oldValue) {
            $scope.profile = newValue;
        });
    }])
    .controller('VideoPlayerCtrl', ['$scope', '$sce', function ($scope, $sce) {
        $scope.queryString = location.search;
        $scope.$sce = $sce;
    }])
;