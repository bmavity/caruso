var util = (function() {
  var that = {};

  var filterOne = function(arrayLike, filterFn, transformFn) {
    var len = arrayLike.length,
        item,
        i;
    
    for(i = 0; i < len; i += 1) {
      item = (transformFn && transformFn(arrayLike[i])) || arrayLike[i];
      if(filterFn(item)) {
        return item;
      }
    }
  };

  that.filterOne = filterOne;

  return that;
})();

(function($) {
  $.filterOne = util.filterOne;
  $.fn.filterOne = function(filterFn, transformFn) {
    return util.filterOne(this, filterFn, function(ele) {
      return $(ele);
    });
  };
})(jQuery);

var injector = (function() {
  var that = {};

  return that;
})();
