var vows = require('vows'),
    assert = require('assert');

var suite = vows.describe('injector');

suite.addBatch({
  'when initiated': {
    topic: function() {
      return require('caruso').injector;
    },

    'should not blow up': function(injector) {
      assert.notEqual(injector, undefined);
    }
  }
});

suite.addBatch({
  'when creating an environment': {
    topic: function() {
      var inj = require('caruso').injector;
      inj.env('<div></div>', this.callback);
    },

    'should have the environment': function(err, env) {
      assert.notEqual(env, undefined);
    }
  }
});

suite.addBatch({
  'when injecting element content': {
    topic: function() {
      var inj = require('caruso').injector;
      inj.env('<div></div>', this.callback);
    },

    'should contain the content': function(err, env) {
      env.inject({ div: 'hi there' });
      assert.ok(env.render().indexOf('<div>hi there</div>') !== -1);
    }
  }
});

suite.addBatch({
  'when injecting id content': {
    topic: function() {
      var inj = require('caruso').injector;
      inj.env('<h1 id="name"></h1>', this.callback);
    },

    'should contain the content': function(err, env) {
      env.inject({ name: 'Rumpletumskin' });
      assert.ok(env.render().indexOf('<h1 id="name">Rumpletumskin</h1>') !== -1);
    }
  }
});

suite.addBatch({
  'when injecting class name content': {
    topic: function() {
      var inj = require('caruso').injector;
      inj.env('<div class="message"></div>', this.callback);
    },

    'should contain the content': function(err, env) {
      env.inject({ message: 'class me' });
      assert.ok(env.render().indexOf('<div class="message">class me</div>') !== -1);
    }
  }
});


suite.run();
