angular.module('mobileModule', [
    'ngRoute',
    'mobile-angular-ui',
    'buzzModule',
    'accountModule',
    'buzzHistoryModule'
])
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/weekly-quiz', {
                templateUrl: 'weekly-quiz.html',
                controller: 'weeklyQuizCtrl',
                controllerAs: 'weeklyQuizCtrl'
            })
            .when('/bind-mobile', {
                templateUrl: 'bind-mobile.html'
            })
            .when('/daily-exercise', {
                templateUrl: 'daily-exercise.html',
                controller: 'quizCtrl',
                controllerAS: 'quizCtrl'
            })
            .when('/today-vocabulary', {
                templateUrl: 'vocabulary.html',
                controller: 'newWordCtrl',
                controllerAS: 'newWordCtrl'
            })
            .when('/avatar', {
                templateUrl: 'avatar.html',
                controller: 'viewAccountCtrl',
                controllerAS: 'viewAccountCtrl'
            })
            .when('/mobile-history', {
                templateUrl: 'history.html',
                controller: 'historyCtrl',
                controllerAS: 'historyCtrl'
            })

        $routeProvider.otherwise('/weekly-quiz');
    }])
    ;