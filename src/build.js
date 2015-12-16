var copy = require('./copy.js');

module.exports = function (opts) {
  copy.clean(opts);

  copy.templates(opts, copy.getData(opts));

  copy.styles(opts);

  copy.images(opts);
};
