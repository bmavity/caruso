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
    define('chains', function() {
      function FunctionChainer() {
        var registrations = {}
          , noop = function() {}
          ;

        var executeChain = function(evt, data, end) {
          var args = Array.prototype.slice.call(arguments, 1)
            , lastEle = args.slice(-1)[0]
            , it = oi.iter(registrations[evt])
            ;

          if(util.isFunction(lastEle)) {
            end = args.pop();
          }

          var executeHandler = function(key, val) {
            var nextFn
              ;
            if(it.hasNext()) {
              nextFn = function() {
                it.next(executeHandler);
              };
            } else {
              nextFn = noop;
            }
            val.apply(null, args.concat([nextFn]));
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

;(function(module) {
  (function(exports, define) {
    define('caruso', function(util, oi, chain) {
      var chainer = new chain.FunctionChainer();
      module.exports = exports = chainer;

      var bindElement = function($ele) {
        var templateArgs;

        var appendArray = function($appendToEle, arr) {
          var $parent = $('<div></div>');
          injectArray($parent, arr);
          $appendToEle.append($parent.children());
        };

        var appendSingle = function($appendToEle, obj) {
          var $templateInstance = templateArgs.$template.clone()
            , bindingDataArgs = {
              $ele: $templateInstance
            , data: obj
            }
            ;
          chainer.executeChain('binding data', bindingDataArgs, function() {
            injectSingle($templateInstance, obj);
            $appendToEle.append($templateInstance);
          });
        };

        var inject = function(data) {
          if(util.isArray(data)) {
            appendArray($ele, data);
          } else {
            appendSingle($ele, data);
          }
        };

        var injectArray = function($injectIntoEle, arr) {
          arr.forEach(function(item) {
            appendSingle($injectIntoEle, item);
          });
        };

        var injectSingle = function($injectIntoEle, obj) {
          var locationArgs
            , locationResult
            ;
          oi.forIn(obj, function(key, val) {
            locationArgs = {
              key: key
            , $template: $injectIntoEle
            };
            locationResult = {};
            chainer.executeChain('matching element', locationArgs, locationResult, function() {
              var $match = locationResult.$match;
              if(util.isString(val) || util.isNumber(val)) {
                chainer.executeChain('setting value', {
                  $match: $match
                , val: val
                });
              } else {
                if(util.isArray(val)) {
                  injectArray($match, val);
                } else {
                  injectSingle($match, val);
                }
              }
            });
          });
        };

        var dataSource = function(source) {
          if(util.isString(source)) {
            $.get(source, function(res) {
              inject(data);
            });
          } else {
            source.on('data', function(data) {
              inject(data);
            });
          }
        };

        setTimeout(function() {
          var templateIn = { $ele: $ele }
            , templateOut = {}
            ;
          chainer.executeChain('locating template', templateIn, templateOut, function() {
            templateArgs = templateOut;
          });
        }, 50);

        return {
          dataSource: dataSource
        };
      };

      exports.bindElement = bindElement;
    });
  })(typeof exports !== 'undefined' ? exports : module.exports
  , typeof define !== 'undefined' ? define : function(name, factoryFn) {
      factoryFn(window.util, window.oi, window.chains);
      window[name] = module.exports;
    }
  );
})(typeof module !== 'undefined' ? module : { exports: {} });
