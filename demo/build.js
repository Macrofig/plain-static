var opts = {
  appRoot: __dirname,
  files: '**/*.txt'
};
var plainStatic = require('../index.js')(opts);
var log = require('debug')('plain-static:demo');

var def = plainStatic();

def.then(function () {
  log('DEMO BUILD COMPLETE');
});
