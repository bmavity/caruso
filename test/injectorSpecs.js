var vows = require('vows'),
    assert = require('assert');

vows.describe('injector').addBatch({
  'when initiated': {
    topic: function() {
      return require('../lib/injector');
    },

    'should not bomb': function(injector) {
      assert.notEqual(injector, undefined);
    }
  }
}).run();
