var appDir = 'app';
var compDir = '_comp';
var distDir = '_dist';

var gulp = require('gulp');
var del = require('del');
var webpack = require('webpack');
var webpackStream = require('webpack-stream');
var $ = require('gulp-load-plugins')();
var electron = require('electron-connect').server.create({path: compDir, stopOnClose: true});

var webpackConfig = require('./webpack.config.js');

gulp.task('comp', ['copy2comp'], function() {
  return gulp.src(appDir + '/**/*.jsx')
    .pipe($.babel())
    .pipe(gulp.dest(compDir));
});

gulp.task('start', ['comp'], function() {
  electron.start(ecallback);
  gulp.watch(appDir + '/main.js', ['erestart']);
  gulp.watch([appDir + '/**', '!' + appDir + '/main.js'], ['ereload']);
});

var ecallback = function(electronProcState) {
  if (electronProcState == 'stopped') {
    electron.start(ecallback);
  }
};
gulp.task('erestart', ['comp'], function() {
  electron.restart();
});
gulp.task('ereload', ['comp'], function() {
  electron.reload();
});

gulp.task('dist', ['copy2dist'], function() {
  return webpackStream(webpackConfig, webpack)
    .pipe(gulp.dest(distDir));
});

gulp.task('copy2comp', ['cclean'], function() {
  gulp.src([appDir + '/**', '!' + appDir + '/**/*.jsx'], {base: appDir})
    .pipe(gulp.dest(compDir));
});

gulp.task('copy2dist', ['dclean'], function() {
  gulp.src([appDir + '/**', '!' + appDir + '/**/*.jsx'], {base: appDir})
    .pipe($.useref())
    .pipe(gulp.dest(distDir));
});

gulp.task('clean', del.bind(null, ['_comp', '_dist']));
gulp.task('cclean', del.bind(null, '_comp'));
gulp.task('dclean', del.bind(null, '_dist'));

gulp.task('lint', function() {
  return gulp.src(['app/**/*.{js,jsx}', '!node_modules/**'])
    .pipe($.eslint({useEslintrc: true, fix: true}))
    .pipe($.eslint.format())
    .pipe($.if(function(file) {return file.eslint != null && file.eslint.fixed;}, gulp.dest('app')));
});