define('caruso.sortedDataSource', function(caruso, EventEmitter2) {
  function SortedDataSource(ds) {
    var emitter = new EventEmitter2()
      , sortedData
      , currentSort
      ;

    var toArray = function(args) {
      return Array.prototype.slice.call(args, 0);
    };

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
