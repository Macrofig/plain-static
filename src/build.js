var copy = require('./copy.js');

module.exports = function (opts) {
  copy.clean(opts);

  copy.templates(opts, copy.getData());

  copy.styles(opts);

  copy.images(opts);

}
