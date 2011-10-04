;(function(module) {
  (function(exports, define) {
    define('util', function() {
      var isArray = function(x) {
        return Object.prototype.toString.call(x) === "[object Array]";
      };

      var isFunction  = function(x) {
        return Object.prototype.toString.call(x) === "[object Function]";
      };

      var isNumber  = function(x) {
        return Object.prototype.toString.call(x) === "[object Number]";
      };

      var isString  = function(x) {
        return Object.prototype.toString.call(x) === "[object String]";
      };

      exports.isArray = isArray;
      exports.isFunction = isFunction;
      exports.isNumber = isNumber;
      exports.isString = isString;
    });
  })(typeof exports !== 'undefined' ? exports : module.exports
  , typeof define !== 'undefined' ? define : function(name, factoryFn) {
      factoryFn();
      window[name] = module.exports;
    }
  );
})(typeof module !== 'undefined' ? module : { exports: {} });

;(function(module) {
  (function(exports, define) {
    define('oi', function() {
      var forIn = function(obj, callback) {
        getKeys(obj).forEach(function(key) {
          callback(key, obj[key]);
        });
      };

      var getKeys = function(obj) {
        return Object.keys(obj);
      };

      var iter = function(obj) {
        var keys = getKeys(obj)
          , i = 0
          ;

        var hasNext = function() {
          return !!keys[i];
        };

        var next = function(callback) {
          var key = keys[i]
            , val = obj[key]
            ;
          i++;
          callback(key, val);
        };

        return {
          hasNext: hasNext
        , next: next
        };
      };

      exports.forEach = forIn;
      exports.forIn = forIn;
      exports.iter = iter;
    });
  })(typeof exports !== 'undefined' ? exports : module.exports
  , typeof define !== 'undefined' ? define : function(name, factoryFn) {
      factoryFn();
      window[name] = module.exports;
    }
  );
})(typeof module !== 'undefined' ? module : { exports: {} });

;(function(module) {
  (function(exports, define) {
    define('decorate', function(oi) {
      var merge = function(obj, extendWith) {
        oi.forEach(extendWith, function(name, val) {
          obj[name] = val;
        });
      };

      exports.merge = merge;
    });
  })(typeof exports !== 'undefined' ? exports : module.exports
  , typeof define !== 'undefined' ? define : function(name, factoryFn) {
      factoryFn(window.oi);
      window[name] = module.exports;
    }
  );
})(typeof module !== 'undefined' ? module : { exports: {} });

;(function(module) {
  (function(exports, define) {
    define('chains', function() {
      function FunctionChainer() {
        var registrations = {}
          , noop = function() {}
          , child
          ;

        var executeChain = function(evt, data, end) {
          var args = Array.prototype.slice.call(arguments, 0)
            , data = args.concat([])
            , evt = data.shift()
            , lastArg = data.slice(-1)[0]
            , end = util.isFunction(lastArg) ? data.pop() : null
            , it = oi.iter(registrations[evt] || {})
            ;

          var executeHandler = function(key, val) {
            var nextFn
              ;
            if(it.hasNext()) {
              nextFn = function() {
                it.next(executeHandler);
              };
            } else if(child) {
              nextFn = function() {
                child.executeChain.apply(child, args);
              };
            } else {
              nextFn = noop;
            }
            val.apply(null, data.concat([nextFn]));
          };
          if(it.hasNext()) {
            it.next(executeHandler);
          }
          end && end();
        };

        var addToChain = function(evt, name, fn) {
          registrations[evt] = registrations[evt] || {};
          registrations[evt][name] = fn;
        };

        var addChild = function(childChain) {
          child = childChain;
        };

        this.addChild = addChild;
        this.addToChain = addToChain;
        this.executeChain = executeChain;
      };

      exports.FunctionChainer = FunctionChainer;
    });
  })(typeof exports !== 'undefined' ? exports : module.exports
  , typeof define !== 'undefined' ? define : function(name, factoryFn) {
      factoryFn();
      window[name] = module.exports;
    }
  );
})(typeof module !== 'undefined' ? module : { exports: {} });
