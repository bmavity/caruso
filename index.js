

var connect = function connect(req, res, next) {
  var path = req.path;
  if(path.indexOf('/caruso/') === 0) {
  } else {
    next();
  }
};

var pathTo = function(name) {
  return __dirname + '/jquery.caruso.' + name + '.js';
};


exports.connect = connect;
exports.pathTo = pathTo;
