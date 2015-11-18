/**
 * Created by sdv on 11/13/15.
 */
(function () {
    'use strict';

    app.factory('model', ['$http', '$log', 'settings', 'authenticator',
        function ($http, $log, settings, authenticator) {

            var model = {};
            model.log = {events: {}};
            model.log.get = logGet;
            model.log.post = logPost;
            model.log.put = logPut;
            model.log.delete = logDelete;

            model.vehicle = {data: {}};
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

            function vehiclePost(vehicleData, successCallback, failureCallback) {
                if (!vehicleData) {
                    var err = 'Header not must be ' + vehicleData;
                    $log.error(err);
                    return failureCallback(err);
                }

                $http.post(settings.API_VEHICLE_URL, vehicleData).then(postSuccess, postFailure);

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
                var err;

                if (!event) {
                    err = 'Event not must be ' + event;
                    $log.error(err);
                    return failureCallback(err);
                }

                if (event._id) {
                    err = 'Post request must not contain _id field';
                    $log.error(err);
                    return failureCallback(err);
                }

                $http.post(settings.API_LOG_URL, event).then(postSuccess, postFailure);

                function postSuccess(response) {
                    // insert data locally
                    event._id = response.data._id;
                    model.log.events[event._id] = event;

                    successCallback(response.message);
                }

                function postFailure(response) {
                    $log.error(response);
                    failureCallback(response);
                }

            }

            function logPut(event, successCallback, failureCallback) {
                var message;

                if (!event) {
                    var err = 'Event not must be ' + event;
                    $log.error(err);
                    return failureCallback(err);
                }

                if (!event._id) {
                    message = 'Event id must be provided to update existing event';
                    $log.error(message);
                    return failureCallback(message);
                }

                $http.put(settings.API_LOG_URL, event).then(putSuccess, putFailure);

                function putSuccess(response) {
                    // change data locally
                    model.log.events[event._id] = event;
                    var message = 'updated event with _id: ' + response._id;

                    successCallback(message);
                }

                function putFailure(response) {
                    $log.error(response);
                    failureCallback(response);
                }

            }

            function logDelete(event, successCallback, failureCallback) {
                if (!event) {
                    var err = 'Event must not be ' + event;
                    $log.error(err);
                    return failureCallback(err);
                }

                var config = {
                    data: event,
                    headers: {"Content-Type": "application/json;charset=utf-8"}
                };

                $http.delete(settings.API_LOG_URL, config).then(deleteSuccess, deleteFailure);

                function deleteSuccess(response) {
                    $log.info(response.message);
                    successCallback(response);
                }

                function deleteFailure(response) {
                    $log.error(response.message);
                    failureCallback(response);
                }

            }

            return model;
        }]);

}());