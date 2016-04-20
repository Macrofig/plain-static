var watch = require('chokidar');
var copy = require('./copy.js');
var log = require('debug')('plain-static:watch');
var noop = function () {
  return;
};

module.exports = function (opts) {
  var data = {};
  var basePath = opts.appRoot + '/' + opts.src;

  return function (cb) {
    copy.getData(opts).then(function (newData) {
      var isLess = false;
      var searchPath = basePath + '/**';
      data = newData;
      cb = typeof cb === 'function' ? cb : noop;
      // data changes
      watch.watch(searchPath, {ignored: /[\/\\]\./}).on('all', function (trigger, filePath) {
        isLess = filePath.indexOf('.less') > -1;
        if (isLess) {
          log('Less file changed.');
          copy.clean(opts, '**/*.css').then(function () {
            copy.styles(opts).then(cb);
            log('Styles updated.');
          });
        } else {
          log('Data file changed.');
          copy.clean(opts, '**/*.html').then(function () {
            copy.getData(opts).then(function (newData) {
              data = newData;
              copy.templates(opts, data).then(cb);
              log('Templates updated.');
            });
          });
        }
      });
    }, function (e) {
      console.log(e.message, e.error);
    });
  };
};
