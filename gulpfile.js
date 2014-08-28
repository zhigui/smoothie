// include the required packages.
var gulp = require('gulp');
var nib = require('nib');
var stylus = require('gulp-stylus');
var rename = require("gulp-rename");

 
// Use stylus and nib
gulp.task('stylus', function () {
  gulp.src('./stylus/smoothie.styl')
    .pipe(stylus({ use: [nib()]}))
    .pipe(rename("smoothie.css"))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('debug', function () {
  gulp.src('./stylus/smoothie.styl')
    .pipe(stylus({ linenos: true, use: [nib()]}))
    .pipe(rename("smoothie.debug.css"))
    .pipe(gulp.dest('./dist/'));
});
 
// stylus with options compress
gulp.task('compress', function () {
  gulp.src('./stylus/smoothie.styl')
    .pipe(stylus({compress: true, use: [nib()]}))
    .pipe(rename("smoothie.min.css"))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('watch', function () {
   gulp.watch('stylus/*.styl', ['default']);
});


// Default gulp task to run
gulp.task('default', ['stylus', 'debug', 'compress', 'watch']);
