var opts = {appRoot: __dirname};
var plainStatic = require('../index.js')(opts);
var debug = require('debug')('demo');

var def = plainStatic();

def.then(function () {
    debug('DEMO BUILD COMPLETE');
});
