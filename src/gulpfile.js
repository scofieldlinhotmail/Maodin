/**
 * Created by bian on 11/30/15.
 */
var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('default', function() {
    gulp.src('./scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./css'));
});