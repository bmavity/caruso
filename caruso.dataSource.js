;(function(module) {
  (function(exports, define) {
    var toArray = function(args) {
      return Array.prototype.slice.call(args, 0);
    };

    define('caruso.ajaxDataSource', function(caruso, EventEmitter2, http) {
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
  })(typeof exports !== 'undefined' ? exports : module.exports
  , typeof define !== 'undefined' ? define : function(name, factoryFn) {
      factoryFn(window.caruso, window.EventEmitter2, window.http);
      window[name] = module.exports;
    }
  );
})(typeof module !== 'undefined' ? module : { exports: {} });

;(function(module) {
  (function(exports, define) {
    var toArray = function(args) {
      return Array.prototype.slice.call(args, 0);
    };

    define('caruso.sortedDataSource', function(caruso, EventEmitter2) {
      function SortedDataSource(ds) {
        var emitter = new EventEmitter2()
          , sortedData
          , currentSort
          ;

        var doSomething = function() {
          if(currentSort) {
            sortData();
          }
          emitter.emit('init');
          emitter.emit('data', sortedData);
        };

        var getSorter = function() {
            var sortKey = currentSort.key
              , lowerCaseOrder = currentSort.order.toLowerCase()
              , orderMultiplier = lowerCaseOrder === 'asc' ? 1 : -1
              ;
          return function(a, b) {
            var aVal = a[sortKey]
              , bVal = b[sortKey]
              , retVal
              ;
            if(bVal === undefined || bVal === null) return 1 * orderMultiplier;
            if(aVal === undefined || aVal === null) return -1 * orderMultiplier;
            if(aVal === bVal) return 0 * orderMultiplier;
            if(aVal > bVal) return 1 * orderMultiplier;
            if(aVal < bVal) return -1 * orderMultiplier;
          };
        };

        var setSort = function(sort) {
          currentSort = sort;
          if(sortedData) {
            doSomething();
          }
        };

        var sortData = function() {
          sortedData.sort(getSorter());
        };

        ds.on('data', function(data) {
          if(!sortedData) {
            sortedData = data;
          } else {
            sortedData.push(data);
          }
          doSomething();
        });

        ds.on('init', function() {
          sortedData = null;
        });

        ds.on('remove', function(data) {
          var len = sortedData.length
            , dataIndex = null
            , i
            ;
          for(i = 0; i < len; i++) {
            if(sortedData[i] === data) {
              dataIndex = i;
              break;
            }
          }
          if(dataIndex !== null) {
            sortedData.splice(dataIndex, 1);
          }
        });

        this.emit = function() {
          emitter.on.apply(emitter, toArray(arguments));
        };
        this.on = function() {
          emitter.on.apply(emitter, toArray(arguments));
        };
        this.add = ds.add;
        this.init = ds.init;
        this.remove = ds.remove;
        this.setSort = setSort;
      };

      exports.SortedDataSource = SortedDataSource;
      caruso.SortedDataSource = SortedDataSource;
    });
  })(typeof exports !== 'undefined' ? exports : module.exports
  , typeof define !== 'undefined' ? define : function(name, factoryFn) {
      factoryFn(window.caruso, window.EventEmitter2);
      window[name] = module.exports;
    }
  );
})(typeof module !== 'undefined' ? module : { exports: {} });

;(function(module) {
  (function(exports, define) {
    var toArray = function(args) {
      return Array.prototype.slice.call(args, 0);
    };

    define('caruso.updatableDataSource', function(caruso, EventEmitter2) {
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
  })(typeof exports !== 'undefined' ? exports : module.exports
  , typeof define !== 'undefined' ? define : function(name, factoryFn) {
      factoryFn(window.caruso, window.EventEmitter2);
      window[name] = module.exports;
    }
  );
})(typeof module !== 'undefined' ? module : { exports: {} });
