define('caruso.ajaxDataSource', function(caruso, EventEmitter2, http) {
  var toArray = function(args) {
    return Array.prototype.slice.call(args, 0);
  };

  var retrieveData = function(url, callback) {
    http.get(url, callback);
  };

  function AjaxDataSource(url) {
    var emitter = new EventEmitter2();

    var add = function(data) {
      emitter.emit('data', data);
    };

    var init = function() {
      retrieveData(url, reset);
    };

    var remove = function(data) {
      emitter.emit('remove', data);
    };

    var reset = function(data) {
      emitter.emit('init');
      add(data);
    };

    this.emit = function() {
      emitter.on.apply(emitter, toArray(arguments));
    };
    this.on = function() {
      emitter.on.apply(emitter, toArray(arguments));
    };
    this.add = add;
    this.init = init;
    this.remove = remove;
  };

  exports.AjaxDataSource = AjaxDataSource;
  caruso.AjaxDataSource = AjaxDataSource;
});
