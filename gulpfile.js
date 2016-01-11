/**
 * Created by minhman.tran on 11/17/2015.
 */
var gulp = require('gulp');
var compass = require('gulp-compass');
var minifyCss = require('gulp-minify-css');
var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');

var rimraf = require('gulp-rimraf');

var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('build', ['compass', 'html']);

gulp.task('default', ['clean', 'build']);

gulp.task('svgmin', function () {
    return gulp.src('app/svg/*.svg')
        .pipe(svgmin())
        .pipe(gulp.dest('dist/svg'));
});

gulp.task('compass', function() {
    gulp.src('app/sass/**/*.scss')
        .pipe(compass({
            config_file: './config.rb',
            css: 'app/css',
            sass: 'app/sass',
            comments: true,
            style: 'expanded'
        }))
        .pipe(browserSync.stream());
});

gulp.task('html', function() {
    return gulp.src(['app/*.html'])
        .pipe(fileInclude({
            indent: true
        }))
        .pipe(useref({searchPath: ['app', '.']}))
        .pipe(gulpif('*.min.js', uglify()))
        .pipe(gulpif('*.min.css', minifyCss()))
        .pipe(gulp.dest('dist/'));
});

// watch Sass files for changes, run the Sass preprocessor with the 'sass' task and reload
gulp.task('serve', ['compass'], function() {
    browserSync({
        port: 8787,
        server: {
            baseDir: ['.tmp', 'app'],
            routes: {
                '/bower': 'bower'
            }
        }
    });

    gulp.watch([
        'app/sass/**/*.scss'
    ], ['compass']);
    gulp.watch([
        './**/*.html',
        'sass/**/*.scss',
        'js/*.js'
    ], {cwd: 'app'}, reload);
});

gulp.task('clean', function() {
    return gulp.src(['.tmp/*', 'dist/*'], { read: true }) //much faster
        .pipe(rimraf({
            force: true
        }));
});

gulp.task('servedist', [], function() {
    browserSync({
        port: 5555,
        server: {
            baseDir: ['dist']
        }
    });
});