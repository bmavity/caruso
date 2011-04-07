var jsdom = require('jsdom');

var forIn = function(obj, callback) {
  Object.keys(obj).forEach(function(key) {
    callback(key, obj[key]);
  });
};

var env = function env(environment, callback) {
  jsdom.env(environment, [
    'jquery-1.5.min.js'
  ], function(err, window) {
    var $document = window.$(window.document);
    callback(null, {
      inject: inject.bind({}, $document),
      render: render.bind({}, $document)
    });
  });
};

var inject = function jQueryInject($set, obj) {
  forIn(obj, function(key, val) {
    var $ele;
    if($set.attr(key)) {
      $set.attr(key, val);
    } else {
      $ele = $set.find('#' + key);
      if($ele.length) {
        setValue($ele, val);
      } else {
        $ele = $set.find(key);
        if($ele.length) {
          setValue($ele, val);
        } else {
          $ele = $set.find('.' + key);
          if($ele.length) {
            setValue($ele, val);
          }
        }
      }
    }
  });
};

var render = function jQueryRender($set) {
  $set.find('script:not(body script)').remove();
  return $set[0].innerHTML;
};

var isObject = function(obj) {
  var type = typeof obj;
  if(type === 'string') return false;
  return true;
};

var setValue = function($set, val) {
  if(isObject(val)) {
    inject($set, val);
  } else {
    $set.html(val);
  }
};


exports.env = env;
