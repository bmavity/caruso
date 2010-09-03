(function($) {
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

  $.filterOne = function(arrayLike, filterFn) {
    return filterOne(arrayLike, filterFn);
  };

  $.fn.filterOne = function(filterFn) {
    return filterOne(this, filterFn, function(ele) {
      return $(ele);
    });
  };
})(jQuery);

(function($) {
  var valSetter = {
        handles: function($element) {
          return true;
        },
        setValue: function($element, val) {
          $element.val(val || '');
        }
      },
      htmlSetter = {
        handles: function($element) {
          return $element.is('td');
        },
        setValue: function($element, val) {
          $element.html(val);
        }
      },
      setters = [htmlSetter, valSetter];

  var pascalize = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  var camelize = function(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  };

  var findElements = function($element, propertyName) {
    var findByIdSelector = '#' + pascalize(propertyName),
        findByClassSelector = '.' + camelize(propertyName);
    return $element.find(findByClassSelector);
  };

  $.fn.inject = function(obj) {
    var propertyName,
        foundElements;

    for(propertyName in obj) {
      foundElements = findElements(this, propertyName);
      if(foundElements.length === 1) {
        setter = $.filterOne(setters, function(setterObj) {
          return setterObj.handles(foundElements);
        });
        setter.setValue(foundElements, obj[propertyName]);
      }
    }

    return this;
  };

  $.pascalize = pascalize;
  $.camelize = camelize;
})(jQuery);
