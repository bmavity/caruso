var connect = require('connect')
  , operatic = require('operatic')
  , caruso = require('../')
  ;

connect(
  operatic.middleware()
, caruso.middleware()
, connect.static(__dirname)
).listen(process.env.PORT || 8000);

