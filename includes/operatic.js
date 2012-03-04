;(function(module) { var exports = module.exports, define = module.define;
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
})(typeof module === 'undefined' ? new window.Module() : module);

;(function(module) { var exports = module.exports, define = module.define;
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

    var toArray = function(arrayLike) {
      return Array.prototype.slice.call(arrayLike, 0);
    };

    exports.isArray = isArray;
    exports.isFunction = isFunction;
    exports.isNumber = isNumber;
    exports.isString = isString;
    exports.toArray = toArray;
  });
})(typeof module === 'undefined' ? new window.Module() : module);
