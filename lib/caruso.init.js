define('caruso.init', function(caruso) {
  var selectorInjector = function(selectorFactory) {
    return function(input, output, next) {
      var $ele = input.$template
        , key = input.key
        , $match = $ele.find(selectorFactory(key))
        ;
      if($match.length) {
        output.$match = $match
      } else {
        next();
      }
    };
  };

  caruso.addToChain('matching element', 'class', selectorInjector(function(key) {
    return '.' + key;
  }));

  caruso.addToChain('matching element', 'name', selectorInjector(function(key) {
    return '[name=' + key + ']';
  }));

  caruso.addToChain('setting value', 'val', function(input, next) {
    var $match = input.$match
        , val = input.val
        ;
    if($match.is('input')) {
      $match.val(val);
    } else {
      next();
    }
  });

  caruso.addToChain('setting value', 'text', function(input, next) {
    var $match = input.$match
        , val = input.val
        ;
    $match.text(val);
  });

  caruso.addToChain('locating template', 'jquery.script', function(input, output, next) {
    var $templateContainer = input.$ele.find('script[type*=template]');
    if($templateContainer.length) {
      output.$template = $($templateContainer.html());
      $templateContainer.remove();
    } else {
      next();
    }
  });

  caruso.addToChain('binding data', 'caruso.data.bind', function(input, next) {
    input.$ele.data('caruso.data', input.data);
    next();
  });

  caruso.addToChain('removing data', 'caruso.data.remove', function(input, next) {
    input.$ele.data('caruso.data', input.data);
    next();
  });
});
