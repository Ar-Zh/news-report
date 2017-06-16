'use strict'

const $ = require('gulp-load-plugins')();
const gulp = require('gulp');
const combiner = require('stream-combiner2').obj;
let LessAutoprefix = require('less-plugin-autoprefix');
let autoprefix = new LessAutoprefix({ browsers: ['last 2 versions'] });
const emitty = require('emitty').setup('src', 'less');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

module.exports = function (options) {
    return function () {
        return combiner(
            gulp.src(options.src)
                .pipe($.if(isDevelopment, $.sourcemaps.init()))
                .pipe($.if(global.watch, emitty.stream()))
                .pipe($.less({
                    plugins: [autoprefix]
                }))
                .pipe($.if(isDevelopment, $.sourcemaps.write()))
                .pipe(gulp.dest(options.dst))
        ).on('error', $.notify.onError());
    };
};