var copy = require('./copy.js');
var Promise = require('promise');
var log = require('debug')('plain-static:build');

module.exports = function (opts) {
  return new Promise(function (res, rej) {
    var defs = [];
    var clean = copy.clean(opts);

    clean.then(function () {
      log('dist folder clean');
      log('Building data object');
      copy.getData(opts).then(function (data) {
        log('building templates');
        defs.push(copy.templates(opts, data));
        log('Compiling LESS');
        defs.push(copy.styles(opts));
        log('Copying files');
        defs.push(copy.staticFiles(opts));

        Promise.all(defs).then(function () {
          log('All the things complete');
          res();
        }, function () {
          log('RUH ROH');
          rej();
        });
      });
    });
  });
};
