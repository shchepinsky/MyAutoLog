(function () {
    'use strict';

    app.factory('settings', [function () {

        //var API_SERVER = '.';
        var API_SERVER = 'http://localhost:8080';

        return {
            // API server URL
            API_LOG_URL: API_SERVER + '/api/log',
            API_VEHICLE_URL: API_SERVER + '/api/vehicle',
            //
            dateFormat: 'mediumDate',
            //
            showDateColumn: true,
            showOdometerColumn: true,
            showDescriptionColumn: true,
            showCountColumn: true,
            showCostColumn: true,
            showNotesColumn: true,
            //
            useAlternativeUI: false,
            useInvertedNavbar: true
        };

    }]);
}());