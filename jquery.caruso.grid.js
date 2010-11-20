(function($) {
  var rowDataKey = 'caruso.grid.rowData';

  var merge = (function() {
  	var that = {};

		var transform = function(mergeInto, mergeFrom) {
			var key,
					oldFn;
			for(key in mergeFrom) {
				if(mergeFrom.hasOwnProperty(key)) {
					if(mergeInto.hasOwnProperty(key)) {
						oldFn = mergeInto[key];
						mergeInto[key] = function(input) {
							oldFn(mergeFrom[key](input));
						};
					} else {
						mergeInto[key] = mergeFrom[key];
					}
				}
			}
		};

		that.transform = transform;
  	return that;
  })();

  var createSortExtension = function(head, body, config) {
    var sortDataKey = 'caruso.grid.sortData',
        thSelector = '.caruso-grid-head tr th',
        asc = 'asc',
        desc = 'desc',
        that = {};

    var handles = function($target) {
      return $target.closest(thSelector).length !== 0;
    };

    var handle = function($target) {
      var $clickedHeader = $target.closest(thSelector),
          sortItem = $clickedHeader.data(sortDataKey);

      if(sortItem) {
        sortItem.order = sortItem.order === asc ? desc : asc;
        this.loadData(sortItem);
      };
    };

    var loadData = function() {
      var args = $.makeArray(arguments),
          dataSource = config.dataSource,
          getData = dataSource.getData;

      args.push(body.setData);
      getData.apply(dataSource, args);
    };

    var enrichModel = function($th) {
      var field = $th.attr('class');
      $th.data(sortDataKey, {
        field: field,
        order: desc
      });
    };

		that.enrichModel = enrichModel;
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

  var createBody = function($rowTemplate, lastColumnWidth) {
  	var $bodyDiv = $('<div class="caruso-grid-body"><table><tbody></tbody></table></div>').css({ overflow: 'auto' }),
        $bodyTable = $bodyDiv.find('table'),
        $body = $bodyDiv.find('tbody'),
        scrollbarWidth = $.getScrollbarWidth(),
        clickHandlers = [],
        gridWidth,
  			that = {};

		var appendTo = function($element) {
			$bodyDiv.appendTo($element);
		};
		
    var setColumnWidths = function() {
      if($bodyDiv.height() < $bodyTable.height()) {
        $bodyTable.width(gridWidth - scrollbarWidth);
        $body.find('td:last-child').width(lastColumnWidth - scrollbarWidth);
      }
    };

    var setData = function(data) {
      var $p = $('<div />');
    
      $.each(data, function() {
        var $row = $rowTemplate.clone().inject(this);
        $row.data(rowDataKey, this);
        $p.append($row);
      });
      $body.empty().append($p.children());
      setColumnWidths();
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

  	that.appendTo = appendTo;
  	that.setData = setData;
  	that.setGridWidth = setGridWidth;
  	that.setHandlers = setHandlers;
  	that.setHeight = setHeight;
  	return that;
  };

	var createHead = function($headerRow) {
  	var $headerDiv = $('<div class="caruso-grid-head"><table><thead></thead><tbody></tbody></table></div>'),
        $head = $headerDiv.find('thead'),
        clickHandlers = [],
				that = {};

		$head.append($headerRow);

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
    body.setHeight($grid.height() - head.getHeight());
    body.setGridWidth($grid.width());
    config.dataSource.getData(body.setData);
    
    return that;
  };
  
  var createModel = function($template) {
    var $headerRowTemplate = $template.find('table thead tr:first-child').clone(),
        $dataRowTemplate = $template.find('table tbody tr:first-child').clone();


    $dataRowTemplate.children().each(function(){
      $(this).html('');
    });

    return {
      $headerRow: $headerRowTemplate,
      $dataRow: $dataRowTemplate
    };
  };

  $.fn.carusoGrid = function carusoGrid(config) {
    var model = createModel(this),
        head = createHead(model.$headerRow),
        body = createBody(model.$dataRow, this.find('th:last-child').width()),
        tmpConfig = {
          dataSource: config.dataSource,
          multiSelect: config.multiSelect,
          rowSelectedHandler: config.rowSelectedHandler,
          rowDeselectedHandler: config.rowDeselectedHandler,
          rowDataTransformer: config.rowDataTransformer
        },
        selectionExtension = createSelectionExtension(body),
        sortExtension = createSortExtension(head, body, tmpConfig);
    
		if(config.rowDataTransformer) {
			merge.transform(body, {
				setData: function(data) {
					return $.map(data, config.rowDataTransformer);
			}});
		}
    head.setHandlers([ sortExtension ]);
    body.setHandlers([ selectionExtension ]);
    return createGrid(tmpConfig, $(this[0]), head, body);
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
