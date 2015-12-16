var Mustache = require('mustache');
var fileSave = require('file-save');
var read = require('read-file');
var less = require('less');
var marked = require('marked');
var glob = require('glob');
var path = require('path');
var xtend = require('xtend');
var fse = require('fs-extra');
var del = require('del');
var copy = {};
var debug = require('debug');

var checkDeepProperty = require('./checkDeepProp.js');
var markdown;

// Clear dist
copy.clean = function (opts, pattern) {
  var log = debug('copy:clean');
  log('Cleaning folder');
  pattern = pattern ? pattern : '**';
  var patterns = [opts.dest + '/' + pattern, '!' + opts.dest];
  log(patterns);
  return del.sync(patterns);
};

copy.markdown = markdown = function (opts, filePath) {
  var log = debug('copy:markdown');
  log('Compiling markdown', filePath);
  return marked(read.sync(filePath, 'utf8'));
};

copy.getData = function (opts) {
  var log = debug('copy:getData');
  log('Pattern:', opts.appRoot + '/' + opts.src + '/**/*.json');
  var data = {};
  // Get JSON
  glob(opts.appRoot + '/' + opts.src + '/**/*.json', function (er, files) {
    log('total json files found:', files.length);
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var fileName = path.basename(file, '.json');
      data[fileName] = JSON.parse(read.sync(file, 'utf8'));
      var hasMD = checkDeepProperty(data[fileName], 'markdown');
      log(hasMD);
      if (hasMD && hasMD.length && hasMD.length > 0) {
        log('JSON file has ' + hasMD.length + ' markdown items.');
        for (var j = 0; j < hasMD.length; j++) {
          log(hasMD[j]);
          var markdownPath = [opts.appRoot + '/'];
          markdownPath.push(opts.src + '/');
          markdownPath.push(hasMD[j].markdown);
          log('Markdown path:', markdownPath.join(''));
          hasMD[j].content = markdown(opts, markdownPath.join(''));
        }
      }
    }
  });

  // Build content
  glob(opts.appRoot + '/' + opts.src + '/**/*.md', function (er, files) {
    log('total md files found:', files.length);
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var fileName = path.basename(file, '.md');
      var md = markdown(opts, file);
      data[fileName] = xtend(data[fileName] || {}, {content: md});
    }
  });

  return data;
};

// Build templates
copy.templates = function (opts, data) {
  var log = debug('copy:templates');
  var destPath;
  var file;
  var fileName;
  var callbacks = {
    finish: function () {
      log(file + ' saved to ' + destPath);
    },
    error: function () {
      log('error saving ' + fileName);
    }
  };
  glob(opts.appRoot + '/' + opts.src + '/**/*.mustache', function (er, files) {
    log('total mustache templates found:', files.length);
    for (var i = 0; i < files.length; i++) {
      destPath = '';
      file = files[i] || '';
      fileName = path.basename(file, '.mustache') || '';
      log('Processing template:', fileName);
      // Get files
      var template = read.sync(file, 'utf8');
      // Build
      var indexFile = Mustache.render(template, data[fileName]);
      if (fileName === 'index') {
        destPath = opts.appRoot + '/' + opts.dest + '/' + fileName + '.html';
      } else {
        destPath = opts.appRoot + '/' + opts.dest + '/' + fileName + '/index.html';
      }
      log('Template destinaton:', destPath);

      var fileDef = fileSave(destPath)
        .write(indexFile, 'utf8')
        .end();

      fileDef.finish(callbacks.finish);

      fileDef.error(callbacks.error);
    }
  });
};

// Build styles
copy.styles = function (opts) {
  var log = debug('copy:styles');
  var fileName;
  var file;
  var processor = function (e, output) {
    var destPath = opts.appRoot + '/' + opts.dest + '/' + fileName + '.css';
    var lessDef = fileSave(destPath)
      .write(output.css, 'utf8')
      .end();

    lessDef.finish(function () {
      log(file + ' saved to ' + destPath);
    });

    lessDef.error(function () {
      log('error saving ' + fileName);
    });
  };
  log('Processing less files.');
  glob(opts.appRoot + '/' + opts.src + '/**/*.less', function (er, files) {
    log('Total Less files found:', files.length);
    for (var i = 0; i < files.length; i++) {
      file = files[i] || '';
      fileName = path.basename(file, '.less') || '';
      log('Processing less file:', fileName);
      var styles = read.sync(file, 'utf8');
      less.render(styles, processor);
    }
  });
};

//copy Images
copy.images = function (opts) {
  var log = debug('copy:images');
  fse.copy(opts.appRoot + '/' + opts.src + '/images/', opts.dest + '/images/', function (err) {
    if (err) {
      log('Image copy error!');
    } else {
      log('Images copied.');
    }
  });
};

module.exports = copy;
