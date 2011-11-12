define('caruso.updatableDataSource', function(caruso, EventEmitter2) {
  var toArray = function(args) {
    return Array.prototype.slice.call(args, 0);
  };

  function UpdatableDataSource(ds, url) {
    var emitter = new EventEmitter2()
      ;

    var doSomething = function() {
      if(currentSort) {
        sortData();
      }
      emitter.emit('init');
      emitter.emit('data', sortedData);
    };

    var updateData = function(updateData) {
    };

    this.emit = function() {
      emitter.on.apply(emitter, toArray(arguments));
    };
    this.on = function() {
      emitter.on.apply(emitter, toArray(arguments));
    };
    this.add = ds.add;
    this.init = ds.init;
    this.remove = ds.remove;
    this.updateData = updateData;
  };

  exports.UpdatableDataSource = UpdatableDataSource;
  caruso.UpdatableDataSource = UpdatableDataSource;
});
