(function() {
    'use strict';

    app.filter('distance', function() {
        return function(input) {
            return input;
        };
    });

    app.filter('quantity', function() {
        return function(input) {
            return input + ' pcs';
        };
    });

    app.filter('currencyUA', function() {
        return function(input) {
            return input.toFixed(2);
        };
    });

}());