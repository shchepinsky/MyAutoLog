(function () {
    'use strict';

    app.controller('IndexCtrl', ['$scope', '$log', '$http', '$location', 'settings',
        function ($scope, $log, $http, $location, settings) {

            $scope.settings = settings;

        }
    ]);
}());