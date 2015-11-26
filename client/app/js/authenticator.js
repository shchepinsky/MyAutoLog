(function () {
    'use strict';

    app.factory('authenticator', ['$cookies', '$log', '$q', '$http', 'facebook', constructor]);
    function constructor($cookies, $log, $q, $http, facebook) {

        var session = {
            username: undefined,
            token: undefined,
            firstName: undefined,
            lastName: undefined,
            clear: function () {
                $log.info('clearing session of ' + this.username);

                session.username = undefined;
                session.token = undefined;
                session.firstName = undefined;
                session.lastName = undefined;

                // remove saved token from header and cookie
                $http.defaults.headers.common.Authorization = undefined;
                $cookies.remove('username');
                $cookies.remove('token');
                $cookies.remove('firstName');
                $cookies.remove('lastName');
            },
            initialize: function (response) {
                // store session data
                session.username = response.data.username;
                session.token = response.data.token;

                session.firstName = response.data.firstName;
                session.lastName = response.data.lastName;

                // save token to header for subsequent requests and cookie
                $http.defaults.headers.common.Authorization = 'Bearer ' + session.token;
                $cookies.put('username', session.username);
                $cookies.put('token', session.token);
                $cookies.put('firstName', session.firstName);
                $cookies.put('lastName', session.lastName);

            },
            getFullUserName: function () {
                // try full name, fallback to username if not defined
                return session.firstName && session.lastName
                    ? session.firstName + ', ' + session.lastName
                    : session.username;
            },
            isAuthenticated: function() {
                return session.username && session.token;
            },
            restore: function () {
                var username = $cookies.get('username');
                var token = $cookies.get('token');

                if (username && token) {
                    session.username = username;
                    session.token = token;
                    session.lastName = $cookies.get('lastName');
                    session.firstName = $cookies.get('firstName');

                    $http.defaults.headers.common.Authorization = 'Bearer ' + session.token;
                }

                return session.isAuthenticated();
            }
        };

        function login(username, password) {

            var deferred = $q.defer();

            $log.info('attempt to login as ' + username);

            var data = {
                'username': username,
                'password': password
            };

            $http.post('./login', data).then(success, failure);

            function success(response) {
                $log.debug('login success: ' + response.data.message);

                session.initialize(response);

                // resolve with authenticated user
                deferred.resolve(response);
            }

            function failure(response) {
                var message = 'Status ' + response.status + ' - ' + response.data;
                $log.error(message);

                session.clear();

                // reject with error message
                deferred.reject(message);
            }

            return deferred.promise;
        }

        function loginFacebook() {
            $log.debug('Facebook login attempted');

            var deferred = $q.defer();

            facebook.login().then(facebookLoginSuccess, facebookLoginFailure);

            function facebookLoginSuccess(profile) {

                var data = {
                    'username': profile.userID,
                    'password': profile.accessToken
                };

                // post Facebook userID and accessToken to server for login
                $http.post('./login/facebook', data).then(success, failure);

                function success(response) {
                    $log.debug('login via Facebook success: ' + response.data.message);

                    session.initialize(response);

                    // resolve with authenticated user
                    deferred.resolve(response);
                }

                function failure(response) {
                    var message = 'Status ' + response.status + ' - ' + response.data;
                    $log.debug(message);

                    session.clear();

                    // reject with error message
                    deferred.reject(message);
                }

            }

            function facebookLoginFailure(response) {
                var message = 'Status ' + response.status + ' - ' + response.data;
                $log.debug(message);

                session.clear();

                // reject with error message
                deferred.reject(message);
            }

            return deferred.promise;
        }

        function logout() {
            $log.debug('logout: ' + session.username);

            session.clear();
        }

        function register(username, password) {

            var data = {
                'username': username,
                'password': password
            };

            var deferred = $q.defer();

            $http.post('/register', data).then(postSuccess, postFailure);

            function postSuccess(response) {
                deferred.resolve(response.data);
            }

            function postFailure(response) {
                var message = 'Status ' + response.status + ' - ' + response.data;

                deferred.reject(message);
            }

            return deferred.promise;
        }

        return {
            register: register,
            logout: logout,
            login: login,
            loginFacebook: loginFacebook,
            session: session
        };
    }
}());