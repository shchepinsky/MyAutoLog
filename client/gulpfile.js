// declare module variables
var gulp = require('gulp'),
    server = require('gulp-connect'),
    livereload = require('gulp-livereload'),
    opn = require('opn');

var appRoot = 'app',
    appFiles = '*.{html,css,json}',
    watchTarget = [appRoot + '/**/' + appFiles];

// define tasks. First parameter is task name, second if function to
// perform. Same like angular and many others - pretty simple.
gulp.task('start server', function() {
    server.server({
        root: appRoot,
        livereload: true,
        port: 8888
    });

    opn('http://localhost:8888');
});

// detect file changes and reload
gulp.task('watch', function() {
    gulp.watch(watchTarget, ['reload']);
});

// reload task
gulp.task('reload', function() {
    gulp.src(watchTarget).pipe(server.reload());
});

// entry point is a task with name 'default'
gulp.task('default', ['start server', 'watch']);