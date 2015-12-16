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
var extraProps = require('./additionalDataProps.js');
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
  var basePath = opts.appRoot + '/' + opts.src;
  log('Pattern:', basePath + '/**/*.json');
  var data = {};

  var checkForMarkdown = function (target) {
    var hasMD = checkDeepProperty(target, 'markdown');
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
  };
  // Get JSON
  glob(basePath + '/**/*.json', function (er, files) {
    log('total json files found:', files.length);
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var fileName = path.basename(file, '.json');
      var filePath = path.dirname(file);
      filePath = filePath.substring(filePath.indexOf(basePath) + basePath.length, filePath.length);

      data[filePath + fileName] = xtend(JSON.parse(read.sync(file, 'utf8')), extraProps);

      checkForMarkdown(data[filePath + fileName]);
    }
  });

  // Get JS
  glob(basePath + '/**/*.js', function (er, files) {
    log('total js files found:', files.length);
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var fileName = path.basename(file, '.js');
      var filePath = path.dirname(file);
      filePath = filePath.substring(filePath.indexOf(basePath) + basePath.length, filePath.length);

      data[filePath + fileName] = xtend(require(file), extraProps);

      checkForMarkdown(data[filePath + fileName]);
    }
  });

  // Build content
  glob(basePath + '/**/*.md', function (er, files) {
    log('total md files found:', files.length);
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var fileName = path.basename(file, '.md');
      var filePath = path.dirname(file);
      filePath = filePath.substring(filePath.indexOf(basePath) + basePath.length, filePath.length);
      var md = markdown(opts, file);
      data[filePath + fileName] = xtend(data[fileName] || {}, {content: md});
    }
  });

  return data;
};

// Build templates
copy.templates = function (opts, data) {
  var log = debug('copy:templates');
  var basePath = opts.appRoot + '/' + opts.src;
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
  glob(basePath + '/**/*.mustache', function (er, files) {
    log('total mustache templates found:', files.length);
    for (var i = 0; i < files.length; i++) {
      destPath = '';
      file = files[i] || '';
      fileName = path.basename(file, '.mustache') || '';
      var filePath = path.dirname(file);
      filePath = filePath.substring(filePath.indexOf(basePath) + basePath.length, filePath.length);

      log('Processing template:', fileName);
      log('template path:', filePath);
      // Get files
      var template = read.sync(file, 'utf8');
      // Build
      var indexFile = Mustache.render(template, data[filePath + fileName]);
      if (fileName === 'index') {
        destPath = opts.appRoot + '/' + opts.dest + filePath + '/' + fileName + '.html';
      } else {
        destPath = opts.appRoot + '/' + opts.dest + filePath + '/' + fileName + '/index.html';
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
  var basePath = opts.appRoot + '/' + opts.src;
  var fileName;
  var file;
  var processor = function (e, output) {
    var filePath = path.dirname(file);
    filePath = filePath.substring(filePath.indexOf(basePath) + basePath.length, filePath.length);
    log('less file path:', filePath);
    var destPath = opts.appRoot + '/' + opts.dest + filePath + '/' + fileName + '.css';
    log('less full path:', destPath);
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
  glob(basePath + '/**/*.less', function (er, files) {
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
