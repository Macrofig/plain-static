var watch = require('chokidar');
var copy = require('./copy.js');
var log = require('debug')('plain-static:watch');
var noop = function () {
  return;
};

module.exports = function (opts) {
  var data = {};

  return function (cb) {
    copy.getData(opts).then(function (newData) {
      data = newData;
      cb = typeof cb === 'function' ? cb : noop;
      // data changes
      watch.watch('./src/?(*.json|*.md)', {ignored: /[\/\\]\./}).on('all', function () {
        log('Data file changed');
        copy.clean(opts, '**/*.html').then(function () {
          copy.getData(opts).then(function (newData) {
            data = newData;
            copy.templates(opts, data).then(cb);
            log('Templates updated.');
          });
        });
      });

      watch.watch('./src/*.mustache', {ignored: /[\/\\]\./}).on('all', function () {
        log('Template changed.');
        copy.clean(opts, '**/*.html').then(function () {
          copy.templates(opts, data).then(cb);
          log('Templates updated.');
        });
      });

      watch.watch('./src/*.less', {ignored: /[\/\\]\./}).on('all', function () {
        log('Less file changed.');
        copy.clean(opts, '**/*.css').then(function () {
          copy.styles(opts).then(cb);
          log('Styles updated.');
        });
      });

      // watch.watch('./src/images/*.*', {ignored: /[\/\\]\./}).on('all', function () {
      //   log('Image file changed.');
      //   copy.clean(opts, 'images/');
      //
      //   copy.images(opts);
      //   cb();
      //   log('Image files updated.');
      // });
    });
  };
};
