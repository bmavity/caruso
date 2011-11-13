var operatic = require('operatic');

var middleware = function() {
  return operatic.middleware().add({
    name: 'caruso'
  , contentDir: __dirname
  , matcher: '/caruso'
  });
};


exports.middleware = middleware;




var pathTo = function(name) {
  return __dirname + '/jquery.caruso.' + name + '.js';
};

exports.pathTo = pathTo;
exports.injector = require('./injector');
