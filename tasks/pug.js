'use strict'

const $ = require('gulp-load-plugins')();
const gulp = require('gulp');
const combiner = require('stream-combiner2').obj;
const emitty = require('emitty').setup('src', 'pug');

module.exports = function (options) {
    return function () {
        return combiner(
            gulp.src(options.src)
                .pipe($.if(global.watch, emitty.stream()))
                .pipe($.pug({ pretty: true }))
                .pipe(gulp.dest(options.dst))
        ).on('error', $.notify.onError());
    };
};