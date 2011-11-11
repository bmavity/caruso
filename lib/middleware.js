var fs = require('fs')
  , path = require('path')
  ;

var wrapFile = function(file) {
  return [
    ';(function(module) {'
  , '  (function(exports, define) {'
  , file
  , '  })(module.exports, module.define);'
  , "})(typeof module !== 'undefined' ?"
  , '    module :'
  , '    ((window.operatic && operatic.Module) ?'
  , '      new operatic.Module() :'
  , "      (function() { throw 'If an AMD system is not available, operatic module shim must be included'; })()"
  , '    )'
  , ');'
  ].join('\n');
};

var middleware = function(options) {
  return function(req, res, next) {
    var write = function(status, headers, content, encoding) {
      res.writeHead(status, headers || undefined);
      res.end(
        req.method !== 'HEAD' && content ? content : ''
      , encoding || undefined
      );
    };

    var serveOperatic = function(operaticUrl) {
      var operaticFileName = operaticUrl.replace('/caruso', '')
        , operaticFilePath = path.join(__dirname, operaticFileName)
        ;
      fs.readFile(operaticFilePath, function(err, operaticFile) {
        var headers
          , content
          ;
        if(err) {
          throw err;
        } else {
          content = wrapFile(operaticFile);
          headers = {
            'Content-Length': content.length
          , 'Content-Type': 'application/javascript'
          };
          write(200, headers, content, 'utf8');
        }
      });
    };


    if('GET' != req.method && 'HEAD' != req.method) {
      return next();
    }
    if(req.url.indexOf('/caruso') === 0) {
      serveOperatic(req.url);
    } else {
      next();
    }
  };
};

exports = middleware;
module.exports = exports;


