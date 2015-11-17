(function () {
    'use strict';

    app.factory('authenticator', ['$cookies', '$log', '$q', '$http',
        function ($cookies, $log, $q, $http) {

            var session = {
                username: undefined,
                token: undefined,
                clear: function() {
                    $log.info('clearing session of ' + this.username);

                    this.username = undefined;
                    this.token = undefined;

                    // remove saved token from header and cookie
                    $http.defaults.headers.common.Authorization = undefined;
                    $cookies.remove('username');
                    $cookies.remove('token');
                }
            };

            function authenticated() {
                return session.username && session.token;
            }

            function restoreSession() {
                var username = $cookies.get('username');
                var token = $cookies.get('token');

                if (username && token) {
                    session.username = username;
                    session.token = token;
                    $http.defaults.headers.common.Authorization = 'Bearer ' + session.token;
                }

                return authenticated();
            }

            function login(username, password) {

                var deferred = $q.defer();

                $log.info('attempt to login as ' + username);

                var data = {'username': username, 'password': password};
                $http.post('./login', data).then(success, failure);

                function success(response) {
                    $log.debug('login success: ' + response.data.message);

                    // store session data
                    session.username = response.data.username;
                    session.token = response.data.token;

                    // save token to header for subsequent requests and cookie
                    $http.defaults.headers.common.Authorization = 'Bearer ' + session.token;
                    $cookies.put('username', session.username);
                    $cookies.put('token', session.token);

                    // resolve with authenticated user
                    deferred.resolve(response);
                }

                function failure(response) {
                    var message = 'Status ' + response.status + ' - ' + response.data;

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

                $http.post('/register', data).then(success, failure);


                function success(response) {
                    deferred.resolve(response.data);
                }

                function failure(response) {
                    var message = 'Status ' + response.status + ' - ' + response.data;

                    deferred.reject(message);
                }

                return deferred.promise;
            }

            return {
                register: register,
                logout: logout,
                login: login,
                authenticated: authenticated,
                restoreSession: restoreSession,

                session: session
            };
        }])
}());