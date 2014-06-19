var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    bump = require('gulp-bump'),
    jshint = require('gulp-jshint'),
    beautify = require('gulp-beautify'),
    istanbul = require("gulp-istanbul"),
    coveralls = require('gulp-coveralls'),
    less = require('gulp-less'),
    bower = require('bower'),
    bowerRequireJS = require('bower-requirejs'),
    requirejs = require('requirejs'),
    es = require('event-stream'),
    coverageEnforcer = require("gulp-istanbul-enforcer"),
    jstConcat = require('gulp-jst-concat'),
    jst = require('gulp-jst'),
    clean = require('gulp-clean'),
    expressService = require('gulp-express-service'),
    rename = require('gulp-rename');

gulp.task('default', ['clean', 'less', 'requirejs', 'enforce-coverage', 'copy', 'bump']);

gulp.task('heroku:staging', ['default']);

gulp.task('clean', function () {
  return gulp.src(['public', '.tmp', 'coverage'], {
    read: false
  }).pipe(clean());
});

gulp.task('copy', ['clean', 'bowerrjs'], function () {
  return es.merge(
  gulp.src('bower_components/requirejs/require.js').pipe(gulp.dest('public/js')), gulp.src('static/html/*.html').pipe(gulp.dest('public')), gulp.src('static/fonts/**/*.*').pipe(gulp.dest('public/fonts')), gulp.src('bower_components/bootstrap/fonts/*.*').pipe(gulp.dest('public/fonts/bootstrap')), gulp.src('static/images/**/*.*').pipe(gulp.dest('public/images')));
});

gulp.task('bower', function (cb) {
  var install = bower.commands.install();

  install.on('log', function (message) {
    //console.log(message);
  });
  install.on('error', function (error) {
    console.log(error);
    cb(error);
  });
  install.on('end', cb.bind(undefined, undefined));
  // place code for your default task here
});

gulp.task('copy-rjs-config', ['clean'], function () {
  return gulp.src("static/js/config.js").pipe(gulp.dest(".tmp"));
});


gulp.task('bowerrjs', ['bower', 'copy-rjs-config'], function (cb) {
  var options = {
    config: ".tmp/config.js",
    baseUrl: 'static/js',
    transitive: true
  };

  bowerRequireJS(options, function (result) {
    console.log(result);
    cb(undefined, result);
  });
});

gulp.task('requirejs', ['clean', 'bowerrjs', 'JST', 'lint'], function (cb) {
  var config = {
    mainConfigFile: ".tmp/config.js",
    baseUrl: 'static/js',
    name: 'main',
    out: 'public/js/main.js',
    optimize: 'none'
  };
  requirejs.optimize(config, cb.bind(undefined, undefined), cb);
});

gulp.task('coveralls', ['enforce-coverage'], function () {
  return gulp.src('coverage/**/lcov.info').pipe(coveralls());
});

gulp.task('less', ['clean', 'bower'], function () {
  return gulp.src('static/less/**/*.less').pipe(less()).pipe(gulp.dest('public/css'));
});

gulp.task('JST', ['clean'], function () {
  return gulp.src('static/templates/**/*html').pipe(jstConcat('jst.js', {
    renameKeys: ['^.*templates[/|\\\\](.*).html$', '$1'],
    amd: true
  })).pipe(gulp.dest('.tmp'));
});

gulp.task('test', ['clean'], function (cb) {
  gulp.src(['./app/**/*.js']).pipe(istanbul()).on('finish', function () {
    gulp.src(["./test/app/**/*.js"]).pipe(mocha()).pipe(istanbul.writeReports()).on('end', cb); // Creating the reports after tests runned
  });
});

gulp.task('enforce-coverage', ['test'], function () {
  var options = {
    thresholds: {
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95
    },
    coverageDirectory: 'coverage',
    rootDirectory: ''
  };
  return gulp.src(['./app/**/*.js']).pipe(coverageEnforcer(options));
});

gulp.task('bump', function () {
  gulp.src(['./package.json', './bower.json']).pipe(bump({
    type: 'patch'
  })).pipe(gulp.dest('./'));
});

gulp.task('lint', ['beautify'], function () {
  return gulp.src(['./app/**/*.js', './test/**/*.js', './gulpfile.js', 'static/js/**/*.js']).pipe(jshint()).pipe(jshint.reporter('default'));
});

gulp.task('beautify', function () {
  gulp.src(['./app/**/*.js', './test/**/*.js', './gulpfile.js', 'static/js/**/*.js'], {
    base: '.'
  }).pipe(beautify({
    indentSize: 2,
    preserveNewlines: true
  })).pipe(gulp.dest('.'));
});

gulp.task('bowerrjs-client', ['bower', 'copy-rjs-config-client'], function (cb) {
  var options = {
    config: ".tmp/config-client.js",
    baseUrl: 'test/static',
    transitive: true
  };

  bowerRequireJS(options, function (result) {
    console.log(result);
    cb(undefined, result);
  });
});

gulp.task('copy-rjs-config-client', ['clean'], function () {
  return gulp.src("test/static/config.js").pipe(rename({
    suffix: '-client'
  })).pipe(gulp.dest(".tmp"));
});

gulp.task('requirejs-client', ['clean', 'bowerrjs-client', 'JST'], function (cb) {
  var config = {
    mainConfigFile: ".tmp/config-client.js",
    baseUrl: 'static/js',
    name: '../../test/static/index',
    out: 'test/static/specrunner.js',
    optimize: 'none'
  };
  requirejs.optimize(config, cb.bind(undefined, undefined), cb);
});