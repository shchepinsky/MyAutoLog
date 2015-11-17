(function() {
    "use strict";

    // custom Angular validator that compares two password fields

    app.directive('requiredToMatch', function () {
        return {
            require: 'ngModel',
            link: function ($scope, $elem, $attr, ngModel) {

                // setup validation triggers for matched fields
                ngModel.$viewChangeListeners.push(function () {
                    $scope.form[$attr.requiredToMatch].$validate();
                });

                ngModel.$validators.requiredToMatch = function (value) {
                    // all we have to do is return valid or not,
                    // the rest does Angular
                    var other = $scope[$attr.requiredToMatch];
                    return (value === other);
                }
            }
        };
    });

}());