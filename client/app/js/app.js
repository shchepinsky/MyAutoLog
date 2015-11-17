(function () {
    'use strict';

    window.app = angular.module('MyCarLogger', ['ngRoute', 'ngMessages', 'ngCookies']);

    app.config(['$routeProvider',
        function ($routeProvider) {

            $routeProvider.when('/register', {
                templateUrl: 'views/register.html',
                controller: 'RegisterViewCtrl'
            });

            $routeProvider.when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            });

            $routeProvider.when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            });

            $routeProvider.otherwise({
                redirectTo: '/logout'
            });
        }

    ]);

    app.run(['$rootScope', '$location', 'authenticator', function($rootScope, $location, authenticator) {

        $rootScope.$on('$locationChangeStart', function($scope, next, current) {

            // we need this if we use modals
            // close modal if any using jQuery
            $('.modal-backdrop').remove();

            // protecting app routes
            // if not authenticated and no stored session - redirect to login page
            if (!authenticator.authenticated || !authenticator.restoreSession()) {
                $location.path('/login');
            }

        });
    }]);
}());