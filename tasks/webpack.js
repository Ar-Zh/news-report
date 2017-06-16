'use strict'

const $ = require('gulp-load-plugins')();
const gulp = require('gulp');
const combiner = require('stream-combiner2').obj;
const path = require('path');

const webpackStream = require('webpack-stream');
const named = require('vinyl-named');


const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

module.exports = function (options) {
    return function (callback) {

        let options = {

            watch: true,
            devtool: 'cheap-module-inline-source-map',
            module:  {
                loaders: [{
                    test:    /\.js$/,
                    loader:  'babel?presets[]=es2015'
                }]
            }
        };

        return gulp.src(options.src)
                .pipe(named())
                .pipe(webpackStream(options))
                .pipe(gulp.dest(options.dst));
    };
};