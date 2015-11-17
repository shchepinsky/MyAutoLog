/**
 * Created by sdv on 11/14/15.
 */
(function () {
    "use strict";

    app.controller('VehicleDataCtrl',
        ['$scope', '$http', '$log', 'settings', 'model', constructor]
    );

    function constructor($scope, $http, $log, settings, model) {

        $scope.settings = settings;
        $scope.model = model;

        $('#vehicleDataModal').on('show.bs.modal', onShowHandler);
        function onShowHandler() {

            // get vehicle data
            model.vehicle.get(processGetSuccess, processGetFailure);

            function processGetSuccess(reason) {
                $log.info(reason);

                // create temp object for editing using stringify/parse
                var jsonClone = JSON.stringify(model.vehicle.data);
                $scope.edit = JSON.parse(jsonClone);

                // reconstruct Date objects because Angular does not
                // allow date strings in ng-model anymore:
                // https://docs.angularjs.org/error/ngModel/datefmt
                $scope.edit.makeDate = new Date($scope.edit.makeDate);
                $scope.edit.purchaseDate = new Date($scope.edit.purchaseDate);

            }

            function processGetFailure(reason) {
                $log.error(reason);
                alert(reason);
            }


        }

        $scope.saveClick = function () {
            // post edited to server
            $http.post(settings.API_VEHICLE_URL, $scope.edit)
                .then(postSuccess, postFailure);

            function postSuccess(response) {
                $log.info(response.data);
                // make local changes
                model.vehicle.data = $scope.edit;
            }

            function postFailure(response) {
                $log.error(response);
                alert(response);
            }
        }
    }

}());