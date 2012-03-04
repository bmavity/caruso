;(function() {
  var functionRegEx = /\(([\s\S]*?)\)/
    , caruso = {}
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
    if(!caruso[name]) {
      throw 'caruso cannot find a module named: "' + name + '".';
    }
    return caruso[name];
  };

  function Module() {
    var self = this;

    var define = function(name, factoryFn) {
      var dependencies = parseDependencies(factoryFn);
      factoryFn.apply({}, dependencies.map(resolve));
      caruso[name] = self.exports;
    };


    this.define = define;
    this.exports = {};
  };


  window.caruso = caruso;
  window.Module = Module;
})();