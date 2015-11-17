/**
 * Created by sdv on 11/13/15.
 */
(function(){
    "use strict";

    app.controller('NewEventCtrl',
        ['$scope', '$log', 'authenticator', 'model', constructor]);

    function constructor($scope, $log, authenticator, model) {

        $scope.model = model;
        $scope.session = authenticator.session;

        $scope.clear = function () {
            $scope.date = undefined;
            $scope.odometer = undefined;
            $scope.description = undefined;
            $scope.count = undefined;
            $scope.cost = undefined;
            $scope.notes = undefined;
        };

        // this jQuery reset form data on each opening
        $('#newEventModal').on('show.bs.modal', $scope.clear);

        $scope.saveClick = function() {

            var event = {
                date: $scope.date,
                odometer: $scope.odometer,
                description: $scope.description,
                count: $scope.count,
                cost: $scope.cost,
                notes: $scope.notes
            };

            model.log.post(event, insertSuccess, insertFailure);

            function insertSuccess(response) {
                // insert success close dialog
                $scope.cancelClick();
                $log.info(response);
            }

            function insertFailure(response) {
                alert('Failed to insert log event');
                $log.error(response);
            }

        };

        $scope.closeClick = function() {
            $('#newEventModal').modal('hide');
        };
    }
}());