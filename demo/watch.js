var opts = {
  appRoot: __dirname,
  files: '**/*.txt'
};
var plainStatic = require('../index.js')(opts);
var log = require('debug')('plain-static:demo');

plainStatic(function () {
  log('Watch updated something');
});
