;(function() {
  var oi = (function() {
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

    return {
      forIn: forIn
    , iter: iter
    };
  })();

  function Registrar() {
    var registrations = {}
      ;

    var register = function(evt, name, fn) {
      registrations[evt] = registrations[evt] || {};
      registrations[evt][name] = fn;
    };

    var hitIt = function(evt, data, end) {
      var args = Array.prototype.slice(arguments, 0)
        , it = oi.iter(registrations[evt])
        ;
      var executeHandler = function(key, val) {
        var nextFn
          ;
        if(it.hasNext()) {
          nextFn = function() {
            it.next(executeHandler);
          };
        } else {
          nextFn = function() {
            end && end();
          }
        }
        val.apply(null, [data, nextFn]);
      };
      if(it.hasNext()) {
        it.next(executeHandler);
      }
    };

    this.hitIt = hitIt;
    this.register = register;
  };

  var setValue = function($match, val) {
    if($match.is('input')) {
      $match.val(val);
    } else {
      $match.text(val);
    }
  };


  (function(module) {
    (function(exports, define) {
      define('caruso', function() {
        module.exports = exports = new Registrar();

        var locateTemplate = function($ele) {
          var $template = $ele.find('script[type*=template]');
          $template.remove();
          return $($template.html());
        };

        var bindElement = function($ele) {
          var $template = locateTemplate($ele);
          var inject = function(data) {
            var injectArgs = {
              $template: $template.clone()
            , data: data
            }
            ;
            exports.hitIt('inject', injectArgs, function() {
              $ele.append(injectArgs.$template);
            });
          };

          return {
            inject: inject
          };
        };

        var selectorInjector = function(selectorFactory) {
          return function(injectArgs, next) {
            var $ele = injectArgs.$template
              , data = injectArgs.data
              ;
              oi.forIn(data, function(key, val) {
                var $match = $ele.find(selectorFactory(key));
                if($match.length !== 0) {
                  setValue($match, val);
                }
              });
            next();
          };
        };

        exports.bindElement = bindElement;
        exports.selectorInjector = selectorInjector;


        var caruso = exports;
        caruso.register('inject', 'class', caruso.selectorInjector(function(key) {
          return '.' + key;
        }));
        caruso.register('inject', 'name', caruso.selectorInjector(function(key) {
          return '[name=' + key + ']';
        }));
      });
    })(typeof exports !== 'undefined' ? exports : module.exports
    , typeof define !== 'undefined' ? define : function(name, factoryFn) {
        factoryFn();
        window[name] = module.exports;
      }
    );
  })(typeof module !== 'undefined' ? module : { exports: {} });
})();
