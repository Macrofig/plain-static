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
var debug = require('debug')('copy');

var checkDeepProperty = require('./checkDeepProp.js');
var markdown;

// Clear dist
copy.clean = function (opts, pattern) {
  pattern = pattern ? pattern : '**';
  return del.sync([opts.dist + '/' + pattern, '!'+opts.dist]);
};

copy.markdown = markdown = function (opts, filePath) {
  return marked(read.sync(filePath, 'utf8'));
};

copy.getData = function (opts) {
  var data = {};
  // Get JSON
  glob('./'+opts.src+'/**/*.json', function (er, files) {
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var fileName = path.basename(file, '.json');
      data[fileName] = JSON.parse(read.sync(file, 'utf8'));
      var hasMD = checkDeepProperty(data[fileName], 'markdown');
      debug(hasMD);
      if (hasMD && hasMD.length && hasMD.length > 0) {
        debug('JSON file has ' + hasMD.length + ' markdown items.');
        for (var j = 0; j < hasMD.length; j++) {
          debug(hasMD[j]);
          var markdownPath = [__dirname];
          markdownPath.push('/../'+opts.src+'/');
          markdownPath.push(hasMD[j].markdown);
          hasMD[j].content = markdown(opts, markdownPath.join(''));
        }
      }
    }
  });

  // Build content
  glob('./'+opts.src+'/**/*.md', function (er, files) {
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
  glob('./'+opts.src+'/**/*.mustache', function (er, files) {
    for (var i = 0; i < files.length; i++) {
      var destPath;
      var file = files[i];
      var fileName = path.basename(file, '.mustache');
      // Get files
      var template = read.sync(file, 'utf8');
      // Build
      var indexFile = Mustache.render(template, data[fileName]);
      if (fileName === 'index') {
        destPath = './'+opts.dist+'/' + fileName + '.html';
      } else {
        destPath = './'+opts.dist+'/' + fileName + '/index.html';
      }

      var fileDef = fileSave(destPath)
        .write(indexFile, 'utf8')
        .end();

      fileDef.finish(function () {
        debug(file + ' saved to ' + destPath);
      });

      fileDef.error(function () {
        debug('error saving ' + fileName);
      });
    }
  });
};

// Build styles
copy.styles = function (opts) {
  glob('./'+opts.src+'/**/*.less', function (er, files) {
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var fileName = path.basename(file, '.less');
      var styles = read.sync(file, 'utf8');
      less.render(styles, function (e, output) {
        var destPath = './'+opts.dist+'/' + fileName + '.css';
        var lessDef = fileSave(destPath)
          .write(output.css, 'utf8')
          .end();

        lessDef.finish(function () {
          debug(file + ' saved to ' + destPath);
        });

        lessDef.error(function () {
          debug('error saving ' + fileName);
        });
      });
    }
  });
};

//copy Images
copy.images = function () {
  fse.copy(opts.src+'/images/', opts.dist+'/images/', function (err) {
    if (err) {
      debug('Image copy error!');
    } else {
      debug('Images copied.');
    }
  });
};

module.exports = copy;
