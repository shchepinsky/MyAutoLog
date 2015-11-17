(function () {
    app.controller('LoginCtrl',
        ['$scope', '$log', '$http', '$location', 'authenticator',
            function ($scope, $log, $http, $location, authenticator) {
                // initialize event handlers

                $scope.loginClick = function () {

                    authenticator.login($scope.username, $scope.password).then(success, failure);

                    function success(response) {
                        // redirect to main view
                        $scope.message = response.message;
                        $scope.session = authenticator.session;

                        $location.path('/');
                    }

                    function failure(message) {
                        // redirect to logout
                        $scope.response = message;
                        $location.path('/login');
                    }

                };

            }
        ]);

}());