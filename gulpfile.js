var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    less = require('gulp-less'),
    gconcat = require('gulp-concat'),
    plumber = require('gulp-plumber'),
    util = require('gulp-util'),
    rev = require('gulp-rev'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    minifyHtml = require('gulp-minify-html'),
    csso = require('gulp-csso'),
    runSequence = require('run-sequence'),
    imagemin = require('gulp-imagemin'),
    gulpIf = require('gulp-if'),
    templateCache = require('gulp-angular-templatecache'),
    argv = require('yargs').argv,
    del = require('del'),
    inject = require('gulp-inject'),
    jeditor = require('gulp-json-editor'),
    ngAnnotate = require('gulp-ng-annotate'),
    jsonminify = require('gulp-jsonminify');

//=======config

var config = {
    mainLessFile: 'source/styles/index.less',
    stylesLocation: 'source/styles/',
    allJsFiles: 'source/app/**/*.js',
    allLessFiles: 'source/styles/**/*.less',
    allCssFiles: 'source/styles/*.css',
    allHtmlFiles: 'source/app/**/*.html',
    fonts: 'source/fonts',
    fontAwesome: 'bower_components/font-awesome/fonts',
    allJsOrdered: ['source/app/app.js', 'source/app/**/*.module.js', 'source/app/**/*.js'],
    index: 'source/app/index.tpl.html',
    images: 'source/images',
    translations: 'source/translations',
    configFile: 'source/app.config',
    release: 'release',
    temp: 'temp'
};

//======= dev tasks
gulp.task('less', function() {
    log('Compiling LESS');
    return gulp.src(config.mainLessFile)
        .pipe(plumber({
            errorHandler: function(err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(less())
        .pipe(gconcat('styles.css'))
        .pipe(gulp.dest(config.stylesLocation));
});

gulp.task('jshint', function() {
    log('Checking JS');
    return gulp.src(config.allJsFiles)
        .pipe(plumber({
            errorHandler: function(err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});


gulp.task('inject', ['jshint', 'less'], function() {
    var
        wiredep = require('wiredep').stream,
        jsSources = config.allJsOrdered,
        cssSources = config.allCssFiles,
        sources = [].concat(jsSources, cssSources);

    log('Injecting files');

    return gulp.src(config.index)
        .pipe(wiredep({ ignorePath: '../' }))
        .pipe(inject(gulp.src(sources), { ignorePath: '/source' }))
        .pipe(rename('index.html'))
        .pipe(gulp.dest('source'));
});

//======= build tasks
gulp.task('fonts', function() {
    log('Copying fonts');
    return gulp.src([
        config.fonts + '/*',
        config.fontAwesome + '/*'])
        .pipe(gulp.dest(config.release + '/fonts'));
});

gulp.task('configFile', function() {
    log('Copying config file');
    return gulp.src(config.configFile)
        .pipe(jsonminify())
        .pipe(gulpIf(argv.prod, jeditor(function(json) {
            json.mode = 'prod';
            return json;
        }), jeditor(function(json) {
            json.mode = 'dev';
            return json;
        })))
        .pipe(gulp.dest(config.release));
});

gulp.task('images', function() {
    log('Optimzating images');
    return gulp.src(config.images + '/*')
        .pipe(imagemin())
        .pipe(gulp.dest(config.release + '/images'));
});

gulp.task('templates', function() {
    log('Gathering templates');
    return gulp.src([config.allHtmlFiles, '!' + config.index])
        .pipe(minifyHtml({ empty: true }))
        .pipe(templateCache({ module: 'app.core', root: 'app/' }))
        .pipe(gulp.dest(config.temp));
});

gulp.task('styles', ['less'], function() {
    return gulp.src(config.allCssFiles)
        .pipe(gulpIf(argv.prod, csso()))
        .pipe(rev())
        .pipe(gulp.dest(config.temp));
});

gulp.task('vendor-styles', function() {
    log('Creating vendor Styles');
    var wiredep = require('wiredep');
    return gulp.src(wiredep().css)
        .pipe(gconcat('vendor.css'))
        .pipe(rev())
        .pipe(gulpIf(argv.prod, csso()))
        .pipe(gulp.dest(config.temp));
});

gulp.task('js', ['jshint', 'templates'], function() {
    log('Creating app.js');
    var jsSources = [].concat(config.allJsOrdered, config.temp + '/templates.js');
    return gulp.src(jsSources)
        .pipe(gconcat('app.js'))
        .pipe(rev())
        .pipe(ngAnnotate())
        .pipe(gulpIf(argv.prod, uglify()))
        .pipe(gulp.dest(config.temp));
});

gulp.task('vendor-js', function() {
    log('Creating vendor JS');
    var wiredep = require('wiredep');
    return gulp.src(wiredep().js)
        .pipe(gconcat('vendor.js'))
        .pipe(rev())
        .pipe(gulpIf(argv.prod, uglify()))
        .pipe(gulp.dest(config.temp));
});

gulp.task('translations', function() {
    log('Creating translations JS');
    return gulp.src(config.translations + '/*')
        .pipe(jsonminify())
        .pipe(gulp.dest(config.release + '/translations'));
});

//======= commands

// create build ( default : dev, --prod key for production (minification + uglify))
gulp.task('build', function() {
    runSequence('clean', ['styles', 'vendor-styles', 'js', 'vendor-js'], ['translations', 'images', 'fonts', 'configFile'],
        function() {
            var
                styles = gulp.src([config.temp + '/vendor-*.css', config.temp + '/styles-*.css']),
                js = gulp.src([config.temp + '/vendor-*.js', config.temp + '/app-*.js']),
                msg = '======= DEV BUILD FINISHED! =======';

            if (argv.prod) {
                msg = '======= PROD BUILD FINISHED! =======';
            }
            util.log(util.colors.green(msg));

            return gulp.src(config.index)
                .pipe(inject(styles.pipe(gulp.dest(config.release + '/styles')), { ignorePath: config.release, addRootSlash: false }))
                .pipe(inject(js.pipe(gulp.dest(config.release + '/js')), { ignorePath: config.release, addRootSlash: false }))
                .pipe(rename('index.html'))
                .pipe(gulpIf(argv.prod, minifyHtml()))
                .pipe(gulp.dest(config.release));
        });
});

// remove all generated files (css, minified/uglified js, temp and release folders)
gulp.task('clean', function(done) {
    log('Cleaning...');
    del([config.temp, config.allCssFiles, config.release]);
    return done();
});

// compiling and injecting files and watching changes (no optimization)
gulp.task('watch', ['inject'], function() {
    log('WATCHING...');
    gulp.watch(config.allJsFiles, ['jshint']);
    gulp.watch(config.allLessFiles, ['less']);
});

// default task, to avoid typing gulp watch :)
gulp.task('default', ['watch']);


//=============Functions==============

function log(msg) {
    util.log(util.colors.blue(msg));
}
