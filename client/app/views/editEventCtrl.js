/**
 * Created by sdv on 11/18/15.
 */
(function(){
    "use strict";

    app.controller('EditEventCtrl', ['$scope', '$log', 'model', constructor]);
    function constructor($scope, $log, model) {

        // cache DOM
        var editEventModal = $('#editEventModal');

        editEventModal.on('show.bs.modal', onShowHandler);
        function onShowHandler(){
            // create temp edit object
            $scope.edit = {};

            // extract unique _id from table row attribute
            $scope.edit._id = editEventModal.attr('eventId');

            if ($scope.edit._id) {
                // copy source event to temp edit object
                angular.extend($scope.edit, model.log.events[$scope.edit._id]);

                // reconstruct date string as object
                $scope.edit.date = new Date($scope.edit.date);
            } else {
                // no id provided - this must be a new event - clear data
                $scope.clear();
            }

        }

        $scope.clear = function () {
            $scope.edit = {};
        };

        $scope.deleteClick = function () {

            function deleteSuccess(response) {
                $log.info(response);
                delete model.log.events[$scope.edit._id];
            }

            function deleteFailure(response) {
                $log.error(response);
                alert(response);
            }

            model.log.delete($scope.edit, deleteSuccess, deleteFailure);

        };

        $scope.saveClick = function() {

            // if _id is provided then model will edit existing event with that _id
            // otherwise model will insert new one
            if ($scope.edit._id) {
                // try to update existing event
                model.log.put($scope.edit, insertSuccess, insertFailure);
            } else {
                // insert new
                model.log.post($scope.edit, insertSuccess, insertFailure);
            }


            function insertSuccess(response) {
                // insert success close dialog
                $scope.closeClick();
                $log.info(response);
            }

            function insertFailure(response) {
                alert('Failed to insert log event');
                $log.error(response);
            }

        };

        $scope.closeClick = function() {
            editEventModal.modal('hide');
        };

    }

}());