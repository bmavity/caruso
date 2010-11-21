(function($) {
  var merge = (function() {
  	var that = {};

		var mutate = function(mergeInto, mergeFrom) {
			var key,
					oldFn;
			for(key in mergeFrom) {
				if(mergeFrom.hasOwnProperty(key)) {
					if(mergeInto.hasOwnProperty(key)) {
						oldFn = mergeInto[key];
						mergeInto[key] = function(input) {
							return mergeFrom[key](oldFn(input));
						}
					} else {
						mergeInto[key] = mergeFrom[key];
					}
				}
			}
		};

		var transform = function(mergeInto, mergeFrom) {
			var key,
					oldFn;
			for(key in mergeFrom) {
				if(mergeFrom.hasOwnProperty(key)) {
					if(mergeInto.hasOwnProperty(key)) {
						oldFn = mergeInto[key];
						mergeInto[key] = function(input) {
							return oldFn(mergeFrom[key](input));
						};
					} else {
						mergeInto[key] = mergeFrom[key];
					}
				}
			}
		};

		that.mutate = mutate;
		that.transform = transform;
  	return that;
  })();

	var createBodyRowDataExtension = function(bodyRowFactory) {
		var rowDataKey = 'caruso.grid.rowData',
				that = {};

		var addRowData = function(rowData) {
			rowData.$row.data(rowDataKey, rowData);
			return rowData;
		};

		merge.mutate(bodyRowFactory, { createRow: addRowData });

		return that;
	};

  var createSortExtension = function(head, body, dataSource, headRowFactory) {
    var sortDataKey = 'caruso.grid.sortData',
        thSelector = '.caruso-grid-head tr th',
        asc = 'asc',
        desc = 'desc',
        that = {};

    var addSortData = function(rowData) {
    	rowData.$row.children().each(function() {
				var $th = $(this),
						field = $th.attr('class');
				$th.data(sortDataKey, {
					field: field,
					order: desc
				});
			});
			return rowData;
    };

    var handles = function($target) {
      return $target.closest(thSelector).length !== 0;
    };

    var handle = function($target) {
      var $clickedHeader = $target.closest(thSelector),
          sortItem = $clickedHeader.data(sortDataKey);

      if(sortItem) {
        sortItem.order = sortItem.order === asc ? desc : asc;
        dataSource.sortData(sortItem);
      };
    };

		merge.mutate(headRowFactory, { createRow: addSortData });

		that.handle = handle;
		that.handles = handles;
    return that;
  };

	var createSelectionExtension = function(body) {
		var selectedRowClassName = 'caruso-grid-selected',
				selectedRowSelector = 'tr.' + selectedRowClassName,
				that = {};

		var deselectAll = function() {
			body.find(selectedRowSelector).removeClass(selectedRowClassName);
		};

		var removeSelected = function() {
			body.find(selectedRowSelector).remove();
		};

		var selectAll = function() {
			body.find('tr').addClass(selectedRowClassName);
		};
		
		var getSelected = function() {
			return body.find(selectedRowSelector);
		};
		
		var handles = function($target) {
			return $target.closest('tr').length === 1;
		};

		var handle = function($target, evt) {
			var $clickedRow = $target.closest('tr'),
					rowIsSelected = $clickedRow.hasClass(selectedRowClassName);

			if(rowIsSelected) {
				$clickedRow.removeClass(selectedRowClassName);
			} else {
				$clickedRow.addClass(selectedRowClassName);
			}
		};

		that.deselectAll = deselectAll;
		that.getSelected = getSelected;
		that.handles = handles;
		that.handle = handle;
		that.removeSelected = removeSelected;
		that.selectAll = selectAll;
		return that;
	};

  var createBody = function(rowFactory, dataSource, lastColumnWidth) {
  	var $bodyDiv = $('<div class="caruso-grid-body"><table><tbody></tbody></table></div>').css({ overflow: 'auto' }),
        $bodyTable = $bodyDiv.find('table'),
        $body = $bodyDiv.find('tbody'),
        scrollbarWidth = $.getScrollbarWidth(),
        clickHandlers = [],
        gridWidth,
        $dummyParent,
  			that = {};

		var addRow = function(data) {
			var rowData = rowFactory.createRow({ data: data });
			$dummyParent.append(rowData.$row);
		};

		var appendTo = function($element) {
			$bodyDiv.appendTo($element);
		};

		var beginBatch = function() {
			$dummyParent = $('<div />');
		};

		var endBatch = function() {
		console.log($dummyParent.children());
			$body.empty().append($dummyParent.children());
			$dummyParent = null;
			setColumnWidths();
		};
		
    var setColumnWidths = function() {
      if($bodyDiv.height() < $bodyTable.height()) {
        $bodyTable.width(gridWidth - scrollbarWidth);
        $body.find('td:last-child').width(lastColumnWidth - scrollbarWidth);
      }
    };

		var setGridWidth = function(width) {
			gridWidth = width;
		};

    var setHandlers = function(handlers) {
    	clickHandlers = handlers;
    };

    var setHeight = function(height) {
    	$bodyDiv.height(height);
    };

		$bodyDiv.click(function(evt) {
      var $target = $(evt.target),
          matchingHandler = $.filterOne(clickHandlers, function(handler) {
            return handler.handles($target);
          });
      matchingHandler.handle($target, evt);
		});

		dataSource.onDataReceived(function(data) {
    	beginBatch();
    	data.forEach(addRow);
    	endBatch();
		});

  	that.appendTo = appendTo;
  	that.setGridWidth = setGridWidth;
  	that.setHandlers = setHandlers;
  	that.setHeight = setHeight;
  	return that;
  };

	var createHead = function(rowFactory) {
  	var $headerDiv = $('<div class="caruso-grid-head"><table><thead></thead><tbody></tbody></table></div>'),
        $head = $headerDiv.find('thead'),
        clickHandlers = [],
				that = {};

		$head.append(rowFactory.createRow());

		var addHeaderRow = function() {
			var rowData = rowFactory.createRow();
			$head.empty().append(rowData.$row);
		};

		var appendTo = function($element) {
			$headerDiv.appendTo($element);
		};

		var getHeight = function() {
			return $headerDiv.height();
		};

		var setHandlers = function(handlers) {
			clickHandlers = handlers;
		};

    $head.click(function(evt) {
      var $target = $(evt.target),
          matchingHandler = $.filterOne(clickHandlers, function(handler) {
            return handler.handles($target);
          });
      matchingHandler.handle($target, evt);
    });
    
		that.addHeaderRow = addHeaderRow;
		that.appendTo = appendTo;
		that.getHeight = getHeight;
		that.setHandlers = setHandlers;
		return that;
	};

  var createGrid = function(config, $placeholder, head, body) {
    var $grid = $placeholder.clone().empty().addClass('caruso-grid').css({ overflow: 'hidden' }),
        that = {};

    $grid.height($placeholder.height());
    $grid.width($placeholder.width());
		head.appendTo($grid);
		body.appendTo($grid);
    $placeholder.replaceWith($grid);
    //hack: figure out where to really put this
    head.addHeaderRow();
    body.setHeight($grid.height() - head.getHeight());
    body.setGridWidth($grid.width());
    
    return that;
  };
  
  var createHeadRowFactory = function($placeholder) {
    var $rowTemplate = $placeholder.find('table thead tr:first-child').clone(),
    		that = {};

    var createRow = function(data) {
    	return {
    		$row: $rowTemplate.clone()
			};
    };

		that.createRow = createRow;
    return that;
  };

	var createBodyRowFactory = function($placeholder) {
		var $rowTemplate = $placeholder.find('table tbody tr:first-child').clone(),
				that = {};
			
		$rowTemplate.children().empty();

		var createRow = function(rowData) {
			rowData.$row = $rowTemplate.clone().inject(rowData.data);
			return rowData;
		};

		that.createRow = createRow;
		return that;
	};

  $.fn.carusoGrid = function carusoGrid(config) {
    var $placeholder = $(this[0]),
    		headRowFactory = createHeadRowFactory($placeholder),
        head = createHead(headRowFactory),
    		bodyRowFactory = createBodyRowFactory($placeholder),
        body = createBody(bodyRowFactory, config.dataSource, this.find('th:last-child').width()),
        tmpConfig = {
          multiSelect: config.multiSelect,
          rowSelectedHandler: config.rowSelectedHandler,
          rowDeselectedHandler: config.rowDeselectedHandler,
        },
        selectionExtension = createSelectionExtension(body),
        sortExtension = createSortExtension(head, body, config.dataSource, headRowFactory),
    		bodyDataExtension = createBodyRowDataExtension(bodyRowFactory);

		if(config.rowDataTransformer) {
			merge.transform(bodyRowFactory, { createRow: config.rowDataTransformer });
		}
		
    head.setHandlers([ sortExtension ]);
    body.setHandlers([ selectionExtension ]);

    return createGrid(tmpConfig, $placeholder, head, body);
  };
})(jQuery);


/*
return $.map($selectedRows, function(row) {
	return $(row).data(rowDataKey);
});
if(config.rowDeselectedHandler) {
	$selectedRows.each(function() {
		config.rowDeselectedHandler($(this).data(rowDataKey));
	});
}
if(config.rowDeselectedHandler) {
	config.rowDeselectedHandler($clickedRow.data(rowDataKey));
}
if(config.rowSelectedHandler) {
	config.rowSelectedHandler($clickedRow.data(rowDataKey));
}

if(config.multiSelect) {
	if(evt.metaKey) {
		toggleSelection();
	} else {
		if(!rowIsSelected) {
			deselectAll();
			selectRow();
		}
	}
}

that.updateRow = function(updateParams) {
	var $rows = $bodyTable.find('tbody > tr'),
			rowData;
	var $matchingRow = $rows.filterOne(function($row) {
		rowData = $row.data(rowDataKey);
		return rowData[updateParams.key.name] === updateParams.key.val;
	});
	$.extend(rowData, updateParams.data);
	$matchingRow.inject(rowData);
};
*/
