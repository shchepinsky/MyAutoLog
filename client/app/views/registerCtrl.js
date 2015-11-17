(function(){

    app.controller('RegisterViewCtrl', ['$scope', '$location', 'authenticator',
        function($scope, $location, authenticator) {

            $scope.registerClick = function () {

                authenticator.register($scope.username, $scope.password).then(success, failure);

                function success(message) {
                    // redirect to login view
                    $location.path('/login');

                    console.log($rootScope.user);
                }

                function failure(message) {
                    $scope.response = message;
                    $location.path('/register');
                }
            };

            // cancel button clicked - return to root url
            $scope.cancelClick = function () {
                $location.path('/');
            }

        }
    ]);

}());