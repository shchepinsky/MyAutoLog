(function () {
    'use strict';

    app.factory('settings', [function () {

        var API_SERVER = 'https://myautologger.local:8080';

        return {
            categories: ['ADMINISTRATIVE', 'FUEL', 'WASHING', 'REPAIRS', 'TUNING', 'MISC'],
            //
            registerPolicy: { passwordLength: 3, loginLength: 3 },
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