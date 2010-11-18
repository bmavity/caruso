(function($) {
  var scrollbarWidth = $.getScrollbarWidth(),
      rowDataKey = 'caruso.grid.rowData';

  var sortExtension = (function() {
    var sortDataKey = 'caruso.grid.sortData',
        thSelector = '.caruso-grid-head tr th',
        asc = 'asc',
        desc = 'desc',
        that = {};

    that.handles = function($target) {
      return $target.closest(thSelector).length !== 0;
    };

    that.handle = function($target) {
      var $clickedHeader = $target.closest(thSelector),
          sortItem = $clickedHeader.data(sortDataKey);

      if(sortItem) {
        sortItem.order = sortItem.order === asc ? desc : asc;
        this.loadData(sortItem);
      };
    };

    that.enrichModel = function($th) {
      var field = $th.attr('class');
      $th.data(sortDataKey, {
        field: field,
        order: desc
      });
    };

    return that;
  })();


  var createBody = function($bodyRowTemplate) {
  	var $bodyDiv = $('<div class="caruso-grid-body"><table><tbody></tbody></table></div>').css({ overflow: 'auto' }),
        $bodyTable = $bodyDiv.find('table'),
        $body = $bodyDiv.find('tbody'),
  			that = {};

		var appendTo = function($element) {
			$bodyDiv.appendTo($element);
		};

    var setColumnWidths = function(gridWidth, lastColumnWidth) {
      if($bodyDiv.height() < $bodyTable.height()) {
        $bodyTable.width(gridWidth - scrollbarWidth);
        $grid.find('td:last-child').width(lastColumnWidth - scrollbarWidth);
      }
    };

    var setData = function(data) {
      var $p = $('<div />');
    
      $.each(data, function() {
        var $row = $bodyRowTemplate.clone().inject(this);
        $row.data(rowDataKey, this);
        $p.append($row);
      });
      $body.empty().append($p.children());
    };

    var setHeight = function(height) {
    	$bodyDiv.height(height);
    };

  	that.appendTo = appendTo;
  	that.setColumnWidths = setColumnWidths;
  	that.setData = setData;
  	that.setHeight = setHeight;
  	return that;
  };

  var createGrid = function(config, body) {
    var $grid = config.$placeholder.clone().empty().addClass('caruso-grid').css({ overflow: 'hidden' }),
        $headerDiv = $('<div class="caruso-grid-head"><table><thead></thead><tbody></tbody></table></div>'),
        $head = $headerDiv.find('thead'),
        lastColumnWidth = config.$placeholder.find('th:last-child').width(),
        firstColumnWidth = config.$placeholder.find('th:first-child').width(),
        that = {};

    $grid.height(config.dimensions.height);
    $grid.width(config.dimensions.width);
    $head.append(config.model.$headerRow);
    $grid.append($headerDiv);


		body.setColumnWidths($grid.width(), lastColumnWidth);
		if(config.rowDataTransformer) {
			var oldSetData = body.setData;
			body.setData = function(data) {
				oldSetData($.map(data, config.rowDataTransformer));
			}
		}
    
    var selectClickHandler = (function() {
      var selectedRowClassName = 'caruso-selected',
          selectedRowSelector = 'tr.' + selectedRowClassName,
          that = {};

      var deselectAll = function() {
        $selectedRows = $bodyTable.find(selectedRowSelector);
        $selectedRows.removeClass(selectedRowClassName);
        if(config.rowDeselectedHandler) {
          $selectedRows.each(function() {
            config.rowDeselectedHandler($(this).data(rowDataKey));
          });
        }
      };
      that.deselectAll = deselectAll;

      that.removeSelected = function() {
				$body.children(selectedRowSelector).remove();
      };

      that.selectAll = function() {
        $bodyTable.find('tr').addClass(selectedRowClassName);
      };
      
      that.getSelected = function() {
        var $selectedRows = $bodyTable.find(selectedRowSelector);
				return $.map($selectedRows, function(row) {
					return $(row).data(rowDataKey);
				});
      };
      
      that.handles = function($target) {
        return $target.closest('tr').length === 1;
      };

      that.handle = function($target, evt) {
        var $clickedRow = $target.closest('tr'),
            rowIsSelected = $clickedRow.hasClass(selectedRowClassName);

        var deselectRow = function() {
          $clickedRow.removeClass(selectedRowClassName);
          if(config.rowDeselectedHandler) {
            config.rowDeselectedHandler($clickedRow.data(rowDataKey));
          }
        };

        var selectRow = function() {
          $clickedRow.addClass(selectedRowClassName);
          if(config.rowSelectedHandler) {
						config.rowSelectedHandler($clickedRow.data(rowDataKey));
          }
        };

        var toggleSelection = function() {
          if(rowIsSelected) {
            deselectRow();
          } else {
            selectRow();
          }
        };

        if(config.multiSelect) {
          if(evt.metaKey) {
            toggleSelection();
          } else {
            if(!rowIsSelected) {
              deselectAll();
              selectRow();
            }
          }
        } else {
          toggleSelection();
        }
      };

      return that;
    })();
    that.deselectAll = selectClickHandler.deselectAll;
    that.getSelected = selectClickHandler.getSelected;
    that.removeSelected = selectClickHandler.removeSelected;
    that.selectAll = selectClickHandler.selectAll;

    var bodyHandlers = [sortExtension, selectClickHandler];

    $grid.click(function(evt) {
      var $target = $(evt.target),
          matchingHandler = $.filterOne(bodyHandlers, function(handler) {
            return handler.handles($target);
          });
      matchingHandler.handle.call({ loadData: loadData }, $target, evt);
    });

    var loadData = function() {
      var args = $.makeArray(arguments),
          dataSource = config.dataSource,
          getData = dataSource.getData;

      args.push(body.setData);
      getData.apply(dataSource, args);
    };

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

		body.appendTo($grid);
    config.$placeholder.replaceWith($grid);
    console.log($headerDiv.height());
    body.setHeight($grid.height() - $headerDiv.height());
    config.dataSource.getData(body.setData);
    
    return that;
  };
  
  var createModel = function($template) {
    var $headerRowTemplate = $template.find('table thead tr:first-child').clone(),
        $dataRowTemplate = $template.find('table tbody tr:first-child').clone();

    $headerRowTemplate.children().each(function() {
      var $this = $(this);
      sortExtension.enrichModel($this);
    });

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
        dimensions = {
          height: this.height(),
          width: this.width()
        },
        body = createBody(model.$dataRow),
        grid = createGrid({
          dataSource: config.dataSource,
          dimensions: dimensions,
          model: model,
          multiSelect: config.multiSelect,
          $placeholder: this,
          rowSelectedHandler: config.rowSelectedHandler,
          rowDeselectedHandler: config.rowDeselectedHandler,
          rowDataTransformer: config.rowDataTransformer
        },
        body
        );
    return grid;
  };
})(jQuery);
