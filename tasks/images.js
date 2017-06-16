'use strict'

const $ = require('gulp-load-plugins')();
const gulp = require('gulp');

module.exports = function (options) {
    return function () {
        return gulp.src(options.src)
            .pipe($.cached('images'))
            .pipe($.remember('images'))
            .pipe(gulp.dest(options.dst));
    };
};