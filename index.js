var xtend = require('xtend');
var defaults = {src: 'src', dist: 'dist'};

var build = require('./src/build.js');

module.exports = function (opts) {
  opts = xtend(defaults, opts);

  return function () {
    return build(opts)
  };
}
