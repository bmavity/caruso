;(function(module) { var exports = module.exports, define = module.define;
  define('caruso', function(util, oi, chain) {
    var globalChainer = new chain.FunctionChainer();
    module.exports = exports = globalChainer;

    var bindElement = function($ele) {
      var localChainer = new chain.FunctionChainer()
        , templateArgs
        , that = localChainer
        ;

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
        that.executeChain('binding data', bindingDataArgs, function() {
          injectSingle($templateInstance, obj);
          $appendToEle.append($templateInstance);
        });
      };

      var inject = function(data) {
        if(util.isArray(data)) {
          appendArray($ele, data);
        } else {
          injectSingle($ele, data);
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
          that.executeChain('matching element', locationArgs, locationResult, function() {
            var $match = locationResult.$match;
            if($match) {
              if(util.isString(val) || util.isNumber(val)) {
                that.executeChain('setting value', {
                  key: key
                , $match: $match
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

      that.addChild(globalChainer);
      that.inject = inject;
      return that;
    };

    exports.bind = bindElement;
  });
})(typeof module === 'undefined' ? new window.Module() : module);
