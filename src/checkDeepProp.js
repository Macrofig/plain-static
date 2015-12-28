var log = require('debug')('plain-static:deepProp');

var checkDeepProperty = function (haystack, needle) {
  log(needle);
  var resp = [];
  if (haystack[needle]) {
    log('found needle:', haystack);
    resp.push(haystack);
  }
  for (var i in haystack) {
    if (haystack.hasOwnProperty(i)) {
      if (haystack[i][needle]) {
        log('found needle:', haystack[i]);
        resp.push(haystack[i]);
      }
      if (haystack[i].length && typeof haystack[i] !== 'string') {
        for (var j = 0; j < haystack[i].length; j++) {
          var check = checkDeepProperty(haystack[i][j], needle);
          if (check.length && check.length > 0) {
            resp = resp.concat(check);
          }
        }
      }
    }
  }
  log(resp);
  return resp;
};
module.exports = checkDeepProperty;
