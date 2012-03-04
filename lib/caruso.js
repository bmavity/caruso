;(function(module) { var exports = module.exports, define = module.define;
  define('caruso', function(util, oi) {
    var inject = function($ele, val) {
      oi.forEach(val, function(val, name) {
        $ele.find('#' + name + ', .' + name).text(val);
      });
    };

    exports.inject = inject;
  });
})(typeof module === 'undefined' ? new window.Module() : module);
