var gulp        = require('gulp'),
    browserSync = require('browser-sync'),
    reload      = browserSync.reload,
    sass        = require('gulp-sass'),
    pleeease    = require('gulp-pleeease'),
    rename      = require('gulp-rename'),
    uglify      = require('gulp-uglify'),
    changed     = require('gulp-changed'),
    del         = require('del'),
    path        = require("path"),
    swig        = require("gulp-swig"),
    imagemin    = require('gulp-imagemin'),
    surge       = require('gulp-surge'),
    options			= {
      setup: function(swig) {
        swig.setDefaults({
          cache: false,
          loader: swig.loaders.fs(__dirname + '/_partials/') // Set partial path root.
        });
      }
		};

var paths = {
  pages: './_pages/',
  partials: './_partials/',
  assets: './_assets/',
  images: './_assets/img/',
  js: './_assets/js/',
  sass: './_sass/',
  outputCss: './_build/assets/css/',
  outputJs: './_build/assets/js/',
  build: './_build/'
};

// clean: uses del to remove build directory

gulp.task('deleteBuild', function (e) {
  del('./_build/', e);
});

// Compile partials and render html files

gulp.task('pages', function() {
  gulp.src([
    path.join(paths.pages, '**/*.html')
  ])
  .pipe(swig(options))
  .pipe(gulp.dest('./_build/'))
  .pipe(reload({stream:true}));
});


//  Compile sass to css

gulp.task('sass', function() {
  gulp.src(path.join(paths.sass, '*.scss'))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(paths.outputCss))
    .pipe(reload({stream:true}));
});

//  Prefix and minify css

gulp.task('minify', function() {
  gulp.src(path.join(paths.outputCss, 'style.css'))
    .pipe(pleeease())
    .pipe(rename({
      suffix: '.min',
      extname: '.css'
    }))
    .pipe(gulp.dest(paths.outputCss));
});

//	Minify JavaScript

gulp.task('uglify', function() {
	gulp.src(path.join(paths.js, '*.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.outputJs));
});

//  Copy assets to _build/assets

gulp.task('assets', function() {
  gulp.src([
    path.join(paths.assets, '**/*.*')
  ])
    .pipe(changed('./_build/assets/'))
    .pipe(gulp.dest('./_build/assets/'))
    .pipe(reload({stream:true}));
});

//  Optimize Images

gulp.task('optimizeImages', function() {
  gulp.src(paths.images)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}]
    }))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('surge', function () {
  return surge({
    project: paths.build
  })
})

//  Setup Browsersync

gulp.task('browsersync', function() {
  browserSync({
    reloadDelay: 300,
    port: 8888,
    server: {
      baseDir: [__dirname] + '/_build/',
    }
  });
});

//  watch: watch for changes and perform corresponding tasks

gulp.task('watcher', function() {
  gulp.watch(path.join(paths.sass, '**/*.scss'), ['sass', 'minify'])
  gulp.watch(path.join(paths.sass, '**/*.js'), ['uglify', 'assets'])
  gulp.watch(path.join(paths.pages, '**/*.html'), ['pages'])
  gulp.watch(path.join(paths.partials, '**/*.html'), ['pages'])
  gulp.watch(path.join(paths.assets, '**/*'), ['assets'])

});

//  Default Gulp Task
//===========================================

gulp.task('default', ['pages', 'sass', 'minify', 'uglify', 'assets', 'browsersync', 'watcher']);
gulp.task('clean', ['deleteBuild']);
gulp.task('deploy', ['optimizeImages', 'surge']);
