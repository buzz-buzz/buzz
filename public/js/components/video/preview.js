angular.module('spaModule')
    .run([function () {
        jwplayer.key = 'lG24bAGJCRLF1gi4kajg4EnUKi+ujyUyKMoSNA==';
    }])
    .controller('jwPlayerCtrl', ['$scope', '$routeParams', '$http', 'subTitleParser', '$rootScope', '$location', 'requestTransformers', '$timeout', function ($scope, $routeParams, $http, subTitleParser, $rootScope, $location, requestTransformers, $timeout) {
        $scope.videoSrc = decodeURIComponent($routeParams.src);
        var videoPlayer = jwplayer('video-player').setup({
            height: document.querySelector('#video-player').offsetHeight,
            width: '100%',
            playlist: [{
                description: status.description,
                image:'//resource.buzzbuzzenglish.com/image/png/buzz-poster.png',
                stretching: 'none',
                sources: [{
                    file: $scope.videoSrc + '.mp4',
                    image:'//resource.buzzbuzzenglish.com/image/png/buzz-poster.png'
                }]
            }]
        })
    }]);