(function () {
    'use strict';

    app.controller('MainCtrl',
        ['$scope', '$log', '$http', '$location', 'authenticator', 'settings', 'model',
            function ($scope, $log, $http, $location, authenticator, settings, model) {

                $scope.settings = settings;
                $scope.session = authenticator.session;
                $scope.model = model;
                $scope.filter = { category : settings.categories[0] };

                $scope.filterEvent = function (event) {

                    // filter out using Find contains/regex
                    if ($scope.filter.pattern) {
                        var s = JSON.stringify(event);
                        var contains = $scope.filter.pattern;

                        if ($scope.filter.useRegEx) {
                            var regex = new RegExp($scope.filter.pattern, 'i');

                            if (!s.match(regex)) return false;
                        } else {

                            if (s.toLowerCase().indexOf(contains.toLowerCase()) < 0) {
                                return false;
                            }
                        }
                    }

                    // filter out using category selector
                    if ($scope.filter.category) {
                        var regex = new RegExp('All|' + event.category, 'i');

                        if (!$scope.filter.category.match(regex) || !event.category) {
                            return false;
                        }
                    }

                    return true;
                };

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
                    $('#editEventModal').modal('show');
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

                $scope.aboutClick = function () {
                    $("#aboutModal").modal();
                }
            }
        ])

}());