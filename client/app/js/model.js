/**
 * Created by sdv on 11/13/15.
 */
(function () {
    'use strict';

    app.factory('model', ['$http', '$log', 'settings', 'authenticator',
        function ($http, $log, settings, authenticator) {

            var model = {};
            model.log = { events: {} };
            model.log.get = logGet;
            model.log.post = logPost;
            model.vehicle = { data: {} };
            model.vehicle.get = vehicleGet;
            model.vehicle.post = vehiclePost;

            function vehicleGet(successCallback, failureCallback) {

                $http.get(settings.API_VEHICLE_URL).then(getSuccess, getFailure);

                function getSuccess(response) {
                    model.vehicle.data = response.data;

                    // restore Date objects from dates passed as strings
                    model.vehicle.data.makeDate = new Date(response.data.makeDate);
                    model.vehicle.data.purchaseDate = new Date(response.data.purchaseDate);

                    var user = authenticator.session.username;
                    var message = 'Fetched vehicle data for ' + user;

                    successCallback(message);
                }

                function getFailure(response) {
                    failureCallback(response.data);
                }

            }

            function vehiclePost(header, successCallback, failureCallback) {
                if (!header) {
                    var err = 'Header not must be ' + header;
                    $log.error(err);
                    return failureCallback(err);
                }

                $http.post(settings.API_VEHICLE_URL, header).then(postSuccess, postFailure);

                function postSuccess(response) {
                    // insert data locally
                    event._id = response.data;
                    model.log.events[event._id] = event;

                    var message = 'inserted event with _id: ' + event._id;
                    successCallback(message);
                }

                function postFailure(response) {
                    $log.error(response);
                    failureCallback(response);
                }

            }


            function logGet(successCallback, failureCallback) {

                $http.get(settings.API_LOG_URL).then(getSuccess, getFailure);

                function getSuccess(response) {
                    model.log.events = response.data;
                    var user = authenticator.session.username;
                    var message = 'Fetched entire log for ' + user;

                    successCallback(message);
                }

                function getFailure(response) {
                    failureCallback(response.data);
                }
            }

            function logPost(event, successCallback, failureCallback) {

                if (!event) {
                    var err = 'Event not must be ' + event;
                    $log.error(err);
                    return failureCallback(err);
                }

                $http.post(settings.API_LOG_URL, event).then(postSuccess, postFailure);

                function postSuccess(response) {
                    // insert data locally
                    event._id = response.data;
                    model.log.events[event._id] = event;

                    var message = 'inserted event with _id: ' + event._id;
                    successCallback(message);
                }

                function postFailure(response) {
                    $log.error(response);
                    failureCallback(response);
                }

            }

            return model;
        }]);

}());