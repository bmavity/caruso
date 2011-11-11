


var pathTo = function(name) {
  return __dirname + '/jquery.caruso.' + name + '.js';
};


exports.pathTo = pathTo;


exports.injector = require('./injector');

exports.middleware = require('./middleware');
