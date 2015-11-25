(function () {
    "use strict";

    app.factory('facebook', ['$log', '$q', constructor]);
    function constructor($log, $q) {

        // this will be called when sdk script is loaded
        window.fbAsyncInit = function () {
            FB.init({
                appId: '192191051123293',
                xfbml: true, 	// parse social plugins on this page
                version: 'v2.5' // use API version 2.5
            });

            $log.info('Facebook SDK initialized');
        };

        // construct script tag if not yet constructed
        var FB_SDK_ID = 'facebook-sdk-script-tag-id';

        var js = document.getElementById(FB_SDK_ID);

        if (!js) {
            js = document.createElement('script');
            js.id = FB_SDK_ID;
            js.src = '//connect.facebook.net/en_US/sdk.js';

            // this loads facebook sdk by attaching it after body
            var html = document.getElementsByTagName('html')[0];
            html.appendChild(js);
            $log.info('Facebook SDK script tag created')
        }


        var profile = {
            clear: function () {
                $log.info('clearing facebook session of user ' + this.username);

                this.username = undefined;
                this.id = undefined;
                this.token = undefined;
            },
            parse: function (response) {
                this.id = response.userID;
                this.token = response.accessToken;
            }
        };

        function processAuthResponse(response, deferred) {
            var profile = {};

            profile.accessToken = response.accessToken;
            profile.userID = response.userID;

            deferred.resolve(profile);
        }


        function login() {
            var deferred = $q.defer();

            var authResponse = FB.getAuthResponse();

            if (authResponse) {

                processAuthResponse(authResponse, deferred);

            } else {

                FB.login(function (response) {
                    console.log(JSON.stringify(response));

                    if (response.status === 'connected') {
                        processAuthResponse(response.authResponse, deferred);
                    }
                });
            }

            return deferred.promise;
        }

        function logout() {
            FB.logout();
        }

        return {
            login: login,
            logout: logout,
            profile: profile
        }
    }

}());