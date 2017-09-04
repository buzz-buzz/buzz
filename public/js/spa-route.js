angular.module('spaModule', [
        'ngRoute',
        'mobile-angular-ui',
        'buzzModule',
        'accountModule',
        'buzzHistoryModule'
    ])
    .run(['$rootScope', '$location', function ($rootScope, $location) {
        $rootScope.$on('$routeChangeSuccess', function (ev, current, previous) {
            $rootScope.back = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                if (history) {
                    history.back();
                } else {
                    location.href = '/';
                }
            };
        });
    }])
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
                controllerAs: 'quizCtrl'
            })
            .when('/today-vocabulary', {
                templateUrl: 'vocabulary.html',
                controller: 'newWordCtrl',
                controllerAs: 'newWordCtrl'
            })
            .when('/avatar', {
                templateUrl: 'avatar.html',
                controller: 'viewAccountCtrl',
                controllerAs: 'viewAccountCtrl'
            })
            .when('/paid-course', {
                templateUrl: 'my-paid-course.html',
                controller: 'memberPaidCourseCtrl',
                controllerAs: 'memberPaidCourseCtrl'
            })
            .when('/user-account', {
                templateUrl: 'user-account.html',
                controller: 'userAccountCtrl',
                controllerAs: 'userAccountCtrl'
            });

        $routeProvider.otherwise('/weekly-quiz');
    }]);