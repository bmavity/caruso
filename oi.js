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
