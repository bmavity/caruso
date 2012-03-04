;(function(module) { var exports = module.exports, define = module.define;
  define('caruso', function(util, oi) {
    var inject = function($ele, val) {
      console.log($ele, val);
    };

    exports.inject = inject;
  });
})(typeof module === 'undefined' ? new window.Module() : module);
