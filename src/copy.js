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
var Promise = require('promise');

var checkDeepProperty = require('./checkDeepProp.js');
var extraProps = require('./additionalDataProps.js');
var markdown;

// Clear dist
copy.clean = function (opts, pattern) {
  var log = debug('plain-static:copy-clean');
  log('Cleaning folder');
  pattern = pattern ? pattern : '**';
  var patterns = [opts.dest + '/' + pattern, '!' + opts.dest];
  log(patterns);
  return del(patterns);
};

copy.markdown = markdown = function (opts, filePath) {
  var log = debug('plain-static:copy-markdown');
  log('Compiling markdown', filePath);
  return marked(read.sync(filePath, 'utf8'));
};

copy.getData = function (opts) {
  var log = debug('plain-static:copy-getData');
  var basePath = opts.appRoot + '/' + opts.src;
  var searchPath = basePath + opts.targetFiles;
  log('Pattern:', searchPath + '/*.json');
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
    return hasMD;
  };

  return new Promise(function (res, rej) {
    // Get JSON
    var jsonFiles = glob.sync(searchPath + '/*.json');
    var i;
    var file;
    var fileName;
    var filePath;
    var foundMDFiles;
    var jsonData;
    var parsedJson;

    if (jsonFiles && jsonFiles.length) {
      log('total json files found:', jsonFiles.length);
      for (i = 0; i < jsonFiles.length; i++) {
        file = jsonFiles[i];
        fileName = path.basename(file, '.json');
        filePath = path.dirname(file);
        filePath = filePath.substring(filePath.indexOf(searchPath) + searchPath.length, filePath.length);

        log('Processing data file', fileName);
        try {
          parsedJson = JSON.parse(read.sync(file, 'utf8'));
        } catch (e) {
          log('JSON Parse error, verify your JSON files.', e);
          rej({
              message: 'JSON Parse error, verify your JSON files.',
              error: e
          });
        }

        jsonData = xtend(parsedJson, extraProps);

        data[filePath + fileName] = jsonData;

        foundMDFiles = checkForMarkdown(jsonData);
        log('JSON MDfiles:', foundMDFiles);
      }
    }

    // Get JS
    var jsFiles = glob.sync(searchPath + '/*.js');
    if (jsFiles && jsFiles.length) {
      log('total js files found:', jsFiles.length);
      for (i = 0; i < jsFiles.length; i++) {
        file = jsFiles[i];
        fileName = path.basename(file, '.js');
        filePath = path.dirname(file);
        filePath = filePath.substring(filePath.indexOf(basePath) + basePath.length, filePath.length);

        data[filePath + fileName] = xtend(require(file), extraProps);

        foundMDFiles = checkForMarkdown(data[filePath + fileName]);
        log('JS MDfiles:', foundMDFiles);
      }
    } else {
      log('No JS files found.');
    }

    // Build content
    var mdFiles = glob.sync(searchPath + '/*.md');
    if (mdFiles && mdFiles.length) {
      log('total md files found:', mdFiles.length);
      for (i = 0; i < mdFiles.length; i++) {
        file = mdFiles[i];
        fileName = path.basename(file, '.md');
        filePath = path.dirname(file);
        filePath = filePath.substring(filePath.indexOf(basePath) + basePath.length, filePath.length);
        var md = markdown(opts, file);
        data[filePath + fileName] = xtend(data[filePath + fileName] || {}, {content: md});
      }
    } else {
      log('No Markdown files found.');
    }
    res(data);
  });
};

// Build templates
copy.templates = function (opts, data) {
  var log = debug('plain-static:copy-templates');
  var basePath = opts.appRoot + '/' + opts.src;
  var searchPath = basePath + opts.targetFiles;
  var destPath;
  var file;
  var fileName;
  var defs = [];
  var callbacks = {
    finish: function () {
      log(file + ' saved to ' + destPath);
    },
    error: function () {
      log('error saving ' + fileName);
    }
  };

  return new Promise(function (res) {
    glob(searchPath + '/*.mustache', function (er, files) {
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
        var indexFile = Mustache.render(template, xtend(data[filePath + fileName], {_global: data.global || {}}));
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
        defs.push(fileDef);
      }
      Promise.all(defs).then(function () {
        log('All templates processed');
        res();
      });
    });
  });
};

// Build styles
copy.styles = function (opts) {
  var log = debug('plain-static:copy-styles');
  var basePath = opts.appRoot + '/' + opts.src;
  var searchPath = basePath + opts.targetFiles;
  var defs = [];
  var buildLess = function (file, styles) {
    var fileName = path.basename(file, '.less') || '';
    log('Processing less file:', fileName);

    less.render(styles, function (e, output) {
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
      defs.push(lessDef);
    });
  };

  log('Processing less files.');
  return new Promise(function (res) {
    glob(searchPath + '/*.less', function (er, files) {
      log('Total Less files found:', files.length);
      for (var i = 0; i < files.length; i++) {
        var file = files[i] || '';
        var styles = read.sync(file, 'utf8');
        buildLess(file, styles);
      }
      Promise.all(defs).then(function () {
        log('All styles processed');
        res();
      });
    });
  });
};

//copy files
copy.staticFiles = function (opts) {
  var basePath = opts.appRoot + '/' + opts.src;
  var searchPath = basePath + opts.targetFiles;
  var log = debug('plain-static:copy-staticFiles');
  var defs = [];

  log('copy.staticFiles');
  var copyFile = function (fileFrom, fileTo) {
    return new Promise(function (res) {
      log('Moving file:', fileFrom);
      log('Target:', fileTo);
      fse.copy(fileFrom, fileTo, function () {
        res();
      });
    });
  };

  return new Promise(function (res) {
    var file;
    var fileName;
    log('Searching for files...');
    glob(searchPath + '/' + opts.files, function (er, files) {
      log('Total files found:', files.length);
      for (var i = 0; i < files.length; i++) {
        file = files[i] || '';
        fileName = path.basename(file, path.extname(file)) || '';
        log('Processing file:', fileName);
        var filePath = path.dirname(file);
        filePath = filePath.substring(filePath.indexOf(basePath) + basePath.length, filePath.length);
        var fileDef = copyFile(file, opts.appRoot + '/' + opts.dest + filePath + '/' + fileName + path.extname(file));

        // fileDef.finish(function () {
        //   log(file + ' saved to ' + destPath);
        // });

        // fileDef.error(function () {
        //   log('error saving ' + fileName);
        // });
        defs.push(fileDef);
      }
      Promise.all(defs).then(function () {
        log('All files processed');
        res();
      });
    });
  });
};
module.exports = copy;
