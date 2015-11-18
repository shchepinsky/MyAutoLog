(function () {
    'use strict';

    app.controller('MainCtrl',
        ['$scope', '$log', '$http', '$location', 'authenticator', 'settings', 'model',
            function ($scope, $log, $http, $location, authenticator, settings, model) {

                $scope.settings = settings;
                $scope.session = authenticator.session;
                $scope.model = model;

                //$scope.session = authenticator.session;
                $scope.refresh = function () {

                    model.log.get(logGetSuccess, logGetFailure);

                    function logGetSuccess(response) {
                        $log.info(response);
                    }

                    function logGetFailure(response) {
                        $log.error(response);
                    }

                };

                $scope.refresh();

                $scope.toggleColumn = function ($event, flagName) {
                    // this stops checkbox menu item from being closed
                    $event.stopPropagation();
                    $event.preventDefault();

                    // this toggles column visibility flag
                    $scope.settings[flagName] = !$scope.settings[flagName];
                };

                $scope.newEventClick = function () {
                    $('#newEventModal').modal('show');
                };

                $scope.editEventClick = function (event) {
                    var editEventModal = $('#editEventModal');

                    editEventModal.attr('eventId', event._id);
                    editEventModal.modal('show');
                };

                $scope.logoutClick = function () {

                    if (confirm('Are you sure want to logout?')) {
                        authenticator.logout();
                        $location.path('/login');
                    }

                };
            }
        ])

}());