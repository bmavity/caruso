(function() { var module = new wagner.Module(), exports = module.exports, define = module.define, component = module.component;
  define('transitional', function(component, oi) {
    component.addToChain('creating environment', 'transitional', function(input, env, next) {
      var stateMachine
        , currentStateName
        , currentState;
      var states = function(machine) {
        stateMachine = machine;
        currentStateName = machine.initial;
        currentState = machine[currentStateName];
      };

      input.$ele.click(function(evt) {
        var $target = $(evt.target)
          , isTrigger = $target.hasClass('trigger')
          , rel = $target.attr('rel')
          , $ele = $target.closest('.' + 'customer')
          , state
          ;
        if(isTrigger && rel) {
          stateTransition = currentState[rel];
          stateTransition.before && stateTransition.before($ele, function($transition) {
            $transition = $transition || input.$ele;
            currentState = stateMachine[stateTransition.endState];

            oi.forEach(stateTransition.transition, function(name, val) {
              var $item = $transition.closest('.' + currentStateName);
              $transition[name](val, function() {
                $item.removeClass(currentStateName);
                $item.addClass(stateTransition.endState);
                currentStateName = stateTransition.endState;
              });
            });
          });
        }
      });

      env.states = states;
      next();
    });
  });
})();
