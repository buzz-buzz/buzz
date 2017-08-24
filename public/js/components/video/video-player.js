angular.module('spaModule')
    .run([function () {
        jwplayer.key = 'lG24bAGJCRLF1gi4kajg4EnUKi+ujyUyKMoSNA==';
    }])
    .controller('jwPlayerCtrl1', ['$scope', '$routeParams', '$rootScope', '$http', 'clientConfig', '$timeout', 'api', 'videoStatus', '$location', '$sce', function ($scope, $routeParams, $rootScope, $http, clientConfig, $timeout, api, videoStatus, $location, $sce) {
        videoStatus.get(atob($routeParams.src)).then(function (status) {
            $scope.videoStatus = status;
            var videoPlayer = jwplayer('video-uploaded').setup({
                height: document.querySelector('#video-uploaded').offsetHeight,
                width: '100%',
                playlist: [{
                    description: status.description,
                    image: '//resource.buzzbuzzenglish.com/image/png/buzz-poster.png',
                    stretching: 'none',
                    sources: [{
                        file: $scope.videoStatus.raw + '.mp4',
                        image: '//resource.buzzbuzzenglish.com/image/png/buzz-poster.png'
                    }]
                }]
            })
        })
    }]);