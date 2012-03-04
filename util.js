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
