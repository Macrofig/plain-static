var watch = require('chokidar');
var copy = require('./copy.js');
var debug = require('debug')('watch');
var noop = function () {
  return;
};

module.exports = function (opts) {
  var data = copy.getData(opts);

  return function (cb) {
    cb = typeof cb === 'function' ? cb : noop;
    // data changes
    watch.watch('./src/?(*.json|*.md)', {ignored: /[\/\\]\./}).on('all', function () {
      debug('Data file changed');
      copy.clean(opts, '**/*.html');
      data = copy.getData(opts);
      copy.templates(opts, data);
      cb();
      debug('Templates updated.');
    });

    watch.watch('./src/*.mustache', {ignored: /[\/\\]\./}).on('all', function () {
      debug('Template changed.');
      copy.clean(opts, '**/*.html');

      copy.templates(opts, data);
      cb();
      debug('Templates updated.');
    });

    watch.watch('./src/*.less', {ignored: /[\/\\]\./}).on('all', function () {
      debug('Less file changed.');
      copy.clean(opts, '**/*.css');

      copy.styles(opts);
      cb();
      debug('Styles updated.');
    });

    watch.watch('./src/images/*.*', {ignored: /[\/\\]\./}).on('all', function () {
      debug('Image file changed.');
      copy.clean(opts, 'images/');

      copy.images(opts);
      cb();
      debug('Image files updated.');
    });
  };
};
