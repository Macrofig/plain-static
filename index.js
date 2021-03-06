var xtend = require('xtend');
var defaults = {src: 'src', targetFiles: '/**', dest: 'dist', appRoot: process.cwd()};

var build = require('./src/build.js');
var watcher = require('./src/watch.js');

module.exports = function (opts) {
  opts = xtend(defaults, opts);
  var watch = watcher(opts);
  return function (watchCB) {
    var def = build(opts);
    if (watchCB) {
      watch(watchCB);
    }
    def.catch(function (err) {
      console.error(err.message, err.error);
    });
    return def;
  };
};
