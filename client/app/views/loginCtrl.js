(function () {
    "use strict";

    app.controller('LoginCtrl',
        ['$scope', '$log', '$http', '$location', 'authenticator', 'facebook',
            function ($scope, $log, $http, $location, authenticator, facebook) {
                // initialize event handlers

                $scope.facebook = facebook;

                function loginSuccess(response) {
                    // redirect to main view
                    $scope.message = response.message;
                    $scope.session = authenticator.session;

                    $location.path('/');
                }

                function loginFailure(message) {
                    // redirect to logout
                    $scope.response = message;
                    $location.path('/login');
                }

                $scope.registerClick = function () {
                    $location.path('/register');
                };

                $scope.loginClick = function () {
                    authenticator.login($scope.username, $scope.password).then(loginSuccess, loginFailure);
                };


                $scope.loginFacebook = function () {
                    authenticator.loginFacebook().then(loginSuccess, loginFailure);
                }

            }
        ]);

}());