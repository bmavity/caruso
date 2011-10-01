(function() {
  var module = new wagner.Module(), exports = module.exports, define = module.define, component = module.component;
  define('component.init.caruso', function(component, caruso, decorate) {
    component.addToChain('creating environment', 'caruso', function(input, env, next) {
      decorate.merge(env, caruso.bindElement(input.$ele));
      next();
    });
  });
})();
