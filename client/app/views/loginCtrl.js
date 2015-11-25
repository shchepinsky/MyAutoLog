(function () {
    "use strict";

    app.controller('LoginCtrl',
        ['$scope', '$log', '$http', '$location', 'authenticator',
            function ($scope, $log, $http, $location, authenticator) {
                // initialize event handlers

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

                $scope.loginClick = function () {
                    authenticator.login($scope.username, $scope.password).then(loginSuccess, loginFailure);
                };


                $scope.loginFacebook = function () {
                    authenticator.loginFacebook().then(loginSuccess, loginFailure);
                }

            }
        ]);

}());