'use strict'

const gulp = require('gulp')
const browserSync = require('browser-sync').create();


const AssetsPlugin = require('assets-webpack-plugin');
const webpack = require('webpack');
const notifier = require('node-notifier');
const gulplog = require('gulplog');
const path = require('path');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

function lazyRequireTask(taskName, path, options) {
    options = options || {};
    options.taskName = taskName;
    gulp.task(taskName, function(callback) {
        let task = require(path).call(this, options);

        return task(callback);
    });
}

lazyRequireTask('pug', './tasks/pug', {
    src: 'src/templates/*.pug',
    dst: 'public'
});

lazyRequireTask('less', './tasks/less', {
   src: 'src/styles/style.less',
    dst: 'public/css'
});

gulp.task('webpack', function(callback) {

    let options = {
        entry:   {
            page: './src/js/main',
            page2: './src/js/main2'
        },
        output:  {
            path:     __dirname + '/public/js',
            publicPath: '/js/',
            filename: isDevelopment ? '[name].js' : '[name]-[chunkhash:10].js'
        },
        watch:   isDevelopment,
        devtool: isDevelopment ? 'cheap-module-inline-source-map' : null,
        module:  {
            loaders: [{
                test:    /\.js$/,
                include: path.join(__dirname, "src"),
                loader:  'babel?presets[]=es2015'
            }]
        },
        plugins: [
            new webpack.NoErrorsPlugin() // otherwise error still gives a file
        ]
    };

    if (!isDevelopment) {
        options.plugins.push(
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    // don't show unreachable variables etc
                    warnings:     false,
                    unsafe:       true
                }
            }),
            new AssetsPlugin({
                filename: 'webpack.json',
                path:     __dirname + '/manifest',
                processOutput(assets) {
                    for (let key in assets) {
                        assets[key + '.js'] = assets[key].js.slice(options.output.publicPath.length);
                        delete assets[key];
                    }
                    return JSON.stringify(assets);
                }
            })
        );

    }

    // https://webpack.github.io/docs/node.js-api.html
    webpack(options, function(err, stats) {
        if (!err) { // no hard error
            // try to get a soft error from stats
            err = stats.toJson().errors[0];
        }

        if (err) {
            notifier.notify({
                title: 'Webpack',
                message: err
            });

            gulplog.error(err);
        } else {
            gulplog.info(stats.toString({
                colors: true
            }));
        }

        // task never errs in watch mode, it waits and recompiles
        if (!options.watch && err) {
            callback(err);
        } else {
            callback();
        }

    });


});

lazyRequireTask('images', './tasks/images', {
    src: 'src/images/*.{svg,png,jpeg,jpg}',
    dst: 'public/img'
});

lazyRequireTask('fonts', './tasks/fonts', {
    src: 'src/fonts/*.woff',
    dst: 'public/fonts'
});

lazyRequireTask('clean', './tasks/clean', {
    src: 'public'
});

gulp.task('build', gulp.series('clean',
    gulp.parallel(
        'pug', 'less', 'webpack', 'images', 'fonts'))
);

gulp.task('watch', function() {
    gulp.watch('src/**/*.pug', gulp.series('pug'));
    gulp.watch('src/**/*.less', gulp.series('less'));
    gulp.watch('src/images/*.{svg,png,jpeg,jpg}', gulp.series('images')).on('unlink', function(filepath) {
        remember.forget('images', path.resolve(filepath));
        delete cached.caches.images[path.resolve(filepath)];
    });
    gulp.watch('src/fonts/*.woff', gulp.series('fonts')).on('unlink', function(filepath) {
        remember.forget('fonts', path.resolve(filepath));
        delete cached.caches.fonts[path.resolve(filepath)];
    });
});

gulp.task('serve', function() {
    browserSync.init({
        server: 'public'
    });

    browserSync.watch('public/**/*.*').on('change', browserSync.reload);
});

gulp.task('dev',
    gulp.series('build', gulp.parallel('watch', 'serve'))
);