var jsdom = require('jsdom');

var forIn = function(obj, callback) {
  Object.keys(obj).forEach(function(key) {
    callback(key, obj[key]);
  });
};

var env = function env(environment, callback) {
  jsdom.env(environment, [
    'http://code.jquery.com/jquery-1.5.min.js'
  ], function(err, window) {
    var $document = window.$(window.document);
    callback(null, {
      inject: inject.bind({}, $document),
      render: render.bind({}, $document)
    });
  });
};

var inject = function jQueryInject($set, obj) {
  obj.forIn = forIn.bind({}, obj);
  obj.forIn(function(key, val) {
    var $ele = $set.find(key);
    if($ele.length) {
      $ele.html(val);
    } else {
      $ele = $set.find('.' + key);
      if($ele.length) {
        $ele.html(val);
      }
    }
  });
};

var render = function jQueryRender($set) {
  $set.find('script:not(body script)').remove();
  return $set[0].innerHTML;
};


exports.env = env;
