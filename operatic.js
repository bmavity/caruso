;(function(global) {
  var functionRegEx = /\(([\s\S]*?)\)/
    , modules = {}
    ;

  var parseDependencies = function(fn) {
    return functionRegEx.
      exec(fn)[1].
      replace(/\s/g, '').
      split(',').
      filter(function(name) {
        return name.length !== 0;
      });
  };

  var resolve = function(name) {
    var module = modules[name] || window[name];
    if(!module) {
      throw 'No module named "' + name + '" has been registered or is available globally.';
    }
    return module;
  };

  function Module() {
    var exports = {};

    var define = function(name, factoryFn) {
      var dependencies = parseDependencies(factoryFn);
      factoryFn.apply({}, dependencies.map(resolve));
      modules[name] = exports;
    };

    this.define = define;
    this.exports = exports;
  };

  global.operatic = {
    Module: Module
  };
})(typeof window === 'undefined' ? global : window);
