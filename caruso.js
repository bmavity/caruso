;(function(module) {
  (function(exports, define) {
    define('caruso', function(util, oi, chain, http) {
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
              if($match) {
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
              }
            });
          });
        };

        var dataSource = function(source) {
          if(util.isString(source)) {
            http.get(source, function(res) {
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
      factoryFn(window.util, window.oi, window.chains, window.http);
      window[name] = module.exports;
    }
  );
})(typeof module !== 'undefined' ? module : { exports: {} });
