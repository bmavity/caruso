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

	var createBodyRowDataExtension = function() {
		var rowDataKey = 'caruso.grid.rowData',
				that = {};

		var mutateRowData = function(rowData) {
			rowData.$row.data(rowDataKey, rowData);
		};

		that.mutateRowData = mutateRowData;
		return that;
	};

  var createSortExtension = function(head, body, dataSource) {
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

    var canHandle = function($target) {
      return $target.closest(thSelector).length !== 0;
    };

    var handle = function(carusoEvt) {
			var $target = carusoEvt.$target,
      		$clickedHeader = $target.closest(thSelector);
					
			if(canHandle($target)) {
				$clickedHeader = $target.closest(thSelector),
				toggleSortOrder($clickedHeader);
			}
    };

    var toggleSortOrder = function($clickedHeader) {
			var sortItem = $clickedHeader.data(sortDataKey),
					sortOrder = sortItem.order === asc ? desc : asc;
			sortItem.order = sortOrder;
			dataSource.sortData(sortItem);
    };

		that.handle = handle;
		that.mutateRowData = addSortData;
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
		
		var canHandle = function($target) {
			return $target.closest('tr').length === 1;
		};

		var handle = function(carusoEvt) {
			var $target = carusoEvt.$target,
					$clickedRow;
			if(canHandle($target)) {
				$clickedRow = carusoEvt.$target.closest('tr');
				toggleSelection($clickedRow);
			}
		};

		var toggleSelection = function($clickedRow) {
			var rowIsSelected = $clickedRow.hasClass(selectedRowClassName);
			if(rowIsSelected) {
				$clickedRow.removeClass(selectedRowClassName);
			} else {
				$clickedRow.addClass(selectedRowClassName);
			}
		};

		that.deselectAll = deselectAll;
		that.getSelected = getSelected;
		that.handle = handle;
		that.removeSelected = removeSelected;
		that.selectAll = selectAll;
		return that;
	};

	var createHead = function(activeClickHandlers, activeDataMutators) {
  	var $headerDiv = $('<div class="caruso-grid-head"><table><thead></thead><tbody></tbody></table></div>'),
        $head = $headerDiv.find('thead'),
        clickHandlers = {},
        dataMutators = {},
				that = {};

		var addClickHandler = function(name, handler) {
			clickHandlers[name] = handler;
		};
		
		var addHeaderRow = function(data) {
			var rowData = { data: data };
			activeDataMutators.forEach(function(mutatorName) {
				dataMutators[mutatorName].mutateRowData(rowData);
			});
			$head.empty().append(rowData.$row);
		};

		var addMutator = function(name, mutator) {
			dataMutators[name] = mutator;
		};

    $head.click(function(evt) {
      var carusoEvt = {
						$target: $(evt.target),
						origianlEvent: evt
					};
			
			activeClickHandlers.forEach(function(handlerName) {
				clickHandlers[handlerName].handle(carusoEvt);
			});

			evt.preventDefault();
    });
    
    that.$ele = $headerDiv;
    that.addClickHandler = addClickHandler;
		that.addHeaderRow = addHeaderRow;
		that.addMutator = addMutator;
		return that;
	};

  var createBody = function(activeClickHandlers, activeDataMutators, dataSource, lastColumnWidth) {
  	var $bodyDiv = $('<div class="caruso-grid-body"><table><tbody></tbody></table></div>').css({ overflow: 'auto' }),
        $bodyTable = $bodyDiv.find('table'),
        $body = $bodyDiv.find('tbody'),
        scrollbarWidth = $.getScrollbarWidth(),
        clickHandlers = {},
        dataMutators = {},
        gridWidth,
        $dummyParent,
  			that = {};

		var addClickHandler = function(name, handler) {
			clickHandlers[name] = handler;
		};

		var addMutator = function(name, mutator) {
			dataMutators[name] = mutator;
		};

		var addRow = function(data) {
			var rowData = { data: data };
			activeDataMutators.forEach(function(mutatorName) {
				dataMutators[mutatorName].mutateRowData(rowData);
			});
			$dummyParent.append(rowData.$row);
		};

		var beginBatch = function() {
			$dummyParent = $('<div />');
		};

		var endBatch = function() {
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

		$bodyDiv.click(function(evt) {
      var carusoEvt = {
						$target: $(evt.target),
						origianlEvent: evt
					};
			
			activeClickHandlers.forEach(function(handlerName) {
				clickHandlers[handlerName].handle(carusoEvt);
			});

			evt.preventDefault();
		});

		dataSource.onDataReceived(function(data) {
    	beginBatch();
    	data.forEach(addRow);
    	endBatch();
		});

  	that.$ele = $bodyDiv;
  	that.addClickHandler = addClickHandler;
  	that.addMutator = addMutator;
  	that.setGridWidth = setGridWidth;
  	return that;
  };

  var createGrid = function($placeholder, head, body) {
    var $grid = $placeholder.clone().empty().addClass('caruso-grid').css({ overflow: 'hidden' }),
        that = {};

    $grid.height($placeholder.height());
    $grid.width($placeholder.width());
		$grid.append(head.$ele);
		$grid.append(body.$ele);
    //hack: figure out where to really put this
    head.addHeaderRow();
    $placeholder.replaceWith($grid);
    body.$ele.height($grid.height() - head.$ele.height());
    body.setGridWidth($grid.width());
    
    return that;
  };
  
  var createHeadRowFactory = function($placeholder) {
    var $rowTemplate = $placeholder.find('table thead tr:first-child').clone(),
    		that = {};

    var createRow = function(rowData) {
    		rowData.$row = $rowTemplate.clone()
    };

		that.mutateRowData = createRow;
    return that;
  };

	var createBodyRowFactory = function($placeholder) {
		var $rowTemplate = $placeholder.find('table tbody tr:first-child').clone(),
				that = {};
			
		$rowTemplate.children().empty();

		var mutateRowData = function(rowData) {
			rowData.$row = $rowTemplate.clone().inject(rowData.data);
			return rowData;
		};

		that.mutateRowData = mutateRowData;
		return that;
	};

  $.fn.carusoGrid = function carusoGrid(config) {
    var $placeholder = $(this[0]),
    		headClickHandlers = config.headClickHandlers || ['sortData']
    		headRowMutators = config.headRowMutators || ['defaultFactory', 'addSortData']
        head = createHead(headClickHandlers, headRowMutators),
        bodyClickHandlers = config.bodyClickHandlers || ['rowSelect'],
        bodyRowMutators = config.bodyRowMutators || ['defaultFactory', 'addBodyRowData'],
        body = createBody(bodyClickHandlers, bodyRowMutators, config.dataSource, this.find('th:last-child').width()),
        sortExtension = createSortExtension(head, body, config.dataSource);

		head.addClickHandler('sortData', sortExtension);
		head.addMutator('addSortData', sortExtension);
		head.addMutator('defaultFactory', createHeadRowFactory($placeholder));

		body.addClickHandler('rowSelect', createSelectionExtension(body));
		body.addMutator('addBodyRowData', createBodyRowDataExtension());
		body.addMutator('defaultFactory', createBodyRowFactory($placeholder));
		if(config.rowDataTransformer) {
			body.addMutator('transformer', { mutateRowData: config.rowDataTransformer });
			bodyRowMutators.unshift('transformer');
		}

    return createGrid($placeholder, head, body);
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
