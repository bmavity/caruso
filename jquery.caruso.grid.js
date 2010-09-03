(function($) {
  var scrollbarWidth = $.getScrollbarWidth(),
      sortDataKey = 'caruso.grid.sortData',
      rowDataKey = 'caruso.grid.rowData';

  var createGrid = function(config) {
    var $grid = $('<div class="caruso-grid" />'),
        $headerDiv = $('<div class="caruso-grid-head"><table><thead></thead><tbody></tbody></table></div>'),
        $head = $headerDiv.find('thead'),
        $bodyDiv = $('<div class="caruso-grid-body"><table><tbody></tbody></table></div>'),
        $bodyTable = $bodyDiv.find('table'),
        $body = $bodyDiv.find('tbody'),
        lastColumnWidth = config.$placeholder.find('th:last-child').width(),
        firstColumnWidth = config.$placeholder.find('th:first-child').width(),
        expandColumnWidth,
        that = {};

    $grid.height(config.dimensions.height);
    $grid.width(config.dimensions.width);
    $head.append(config.model.$headerRow);
    $grid.append($headerDiv).append($bodyDiv);

    var setColumnWidths = function() {
      $bodyTable.width($grid.width());
      $headerDiv.find('table').width($grid.width());

      if($bodyDiv.height() < $bodyTable.height()) {
        $bodyTable.width($grid.width() - scrollbarWidth);
        $grid.find('td:last-child').width(lastColumnWidth - scrollbarWidth);
      }
      if(config.detail) {
        if($grid.find('.caruso-grid-head tr th.caruso-expand').length === 0) {
          $grid.find('.caruso-grid-head tr').prepend($('<th class="caruso-expand" />'));
        }
        $grid.find('.caruso-grid-body tr').prepend($('<td class="caruso-expand" />'));
        $grid.find('th:nth-child(2)').width(firstColumnWidth - expandColumnWidth);
        $grid.find('td:nth-child(2)').width(firstColumnWidth - expandColumnWidth);
      }
    };

    var setData = function(data) {
      var $p = $('<div />'),
          $row,
          transformedData;
    
      if(config.rowDataTransformer) {
        transformedData = $.map(data, config.rowDataTransformer);
      }
      $.each((transformedData || data), function() {
        $row = config.model.$dataRow.clone().inject(this);
        $row.data(rowDataKey, this);
        $p.append($row);
      });
      $body.empty().append($p.children());
      setColumnWidths();
    };
    
    $headerDiv.click(function(evt) {
      var $clickedHeader = $(evt.target).closest('th'),
          sortItem = $clickedHeader.length && $clickedHeader.data(sortDataKey);

      if(sortItem) {
        sortItem.order = sortItem.order === 'asc' ? 'desc' : 'asc';
        config.dataSource.getData(sortItem, setData);
      };
    });

    var expandClickHandler = {
      handles: function($target) {
        return $target.closest('td.caruso-expand').length === 1;
      },
      handle: function($target) {
        var $clickedCell = $target.closest('td.caruso-expand'),
            $clickedRow = $clickedCell.closest('tr'),
            $detailRow = $clickedRow.next('.caruso-detail-row'),
            expandedRowClassName = 'caruso-expanded';
        if($clickedCell.length) {
          if($detailRow.length) {
            if($detailRow.is(':visible')) {
              $detailRow.hide();
              $clickedRow.removeClass(expandedRowClassName);
            } else {
              $clickedRow.addClass(expandedRowClassName);
              $detailRow.show();
            }
          } else {
            $clickedRow.addClass(expandedRowClassName);
            $detailRow = $('<tr class="caruso-detail-row"><td colspan="' + (config.model.$dataRow.children().length + 1) + '" class="caruso-detail-cell" /></tr>');
            $detailCell = $detailRow.find('td');
            $detailTable = $('<table><tbody /></table>');
            $detailBody = $detailTable.find('tbody');
            $detailCell.append($detailTable);
            config.detail.dataSource.getData($clickedRow.data(rowDataKey), function(data) {
              var isScrolling = $bodyDiv.height() < $bodyTable.height(),
                  lastColumnScrollingWidth = lastColumnWidth - scrollbarWidth,
                  transformedData;
              if(config.detail.rowDataTransformer) {
                transformedData = $.map(data, config.detail.rowDataTransformer);
              }
              $.each((transformedData || data), function() {
                var $populatedRow = config.detail.model.$dataRow.clone().inject(this);
                $populatedRow.data(rowDataKey, this);
                $detailBody.append($populatedRow);
              });
              if(isScrolling) {
                $detailRow.find('td:last-child').width(lastColumnScrollingWidth);
              }
            });
            $clickedRow.after($detailRow);
          }
        }
      }
    };

    var selectClickHandler = (function() {
      var rowSelectedClassName = 'caruso-selected',
          selectedRowSelector = 'tr.' + rowSelectedClassName,
          that = {};

      var deselectAll = function() {
        $bodyTable.find(selectedRowSelector).removeClass(rowSelectedClassName);
      };
      
      that.handles = function($target) {
        return $target.closest('tr').length === 1;
      };

      that.handle = function($target, evt) {
        var $clickedRow = $target.closest('tr'),
            rowIsSelected = $clickedRow.hasClass(rowSelectedClassName);

        var deselectRow = function() {
          $clickedRow.removeClass(rowSelectedClassName);
        };

        var selectRow = function() {
          $clickedRow.addClass(rowSelectedClassName);
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

    var bodyHandlers = [expandClickHandler, selectClickHandler];

    $bodyDiv.click(function(evt) {
      var $target = $(evt.target),
          matchingHandler = $.filterOne(bodyHandlers, function(handler) {
            return handler.handles($target);
          });
      matchingHandler.handle($target, evt);
    });

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

    var dummy = config.$placeholder.clone();
    dummy.empty().append('<table class="caruso-grid-head caruso-grid-body"><tbody><tr><td class="caruso-expand" /></tr></tbody></table>');
    dummy.css({
        'border': 'none',
        'height': 'auto',
        'left': '-10000',
        'position': 'absolute',
        'width': 'auto'
    });
    $('body').append(dummy);
    expandColumnWidth = dummy.find('.caruso-expand').outerWidth();
    dummy.remove();

    config.$placeholder.replaceWith($grid);
    config.dataSource.getData(setData);
    
    return that;
  };
  
  var createModel = function($template) {
    var $headerRowTemplate = $template.find('table thead tr:first-child').clone(),
        $dataRowTemplate = $template.find('table tbody tr:first-child').clone();

    $headerRowTemplate.children().each(function() {
      var $this = $(this),
          field = $this.attr('class');
      $this.data(sortDataKey, {
        field: field,
        order: 'desc'
      });
    });

    $dataRowTemplate.children().each(function(){
      $(this).html('');
    });

    return {
      $headerRow: $headerRowTemplate,
      $dataRow: $dataRowTemplate
    };
  };

  var createDetailModel = function(model) {
    var $row = $('<tr />');
    for(var key in model) {
      $row.append($('<td class="' + key + '" />'));
    }
    return {
      $dataRow: $row
    };
  };

  $.fn.carusoGrid = function carusoGrid(config) {
    var model = createModel(this),
        dimensions = {
          height: this.height(),
          width: this.width()
        },
        grid = createGrid({
          dataSource: config.dataSource,
          detail: config.detail && {
            dataSource: {
              getData: config.detail.getData
            },
            model: createDetailModel(config.detail.model),
            rowDataTransformer: config.detail.rowDataTransformer
          },
          dimensions: dimensions,
          model: model,
          multiSelect: config.multiSelect,
          $placeholder: this,
          rowSelectedHandler: config.rowSelectedHandler,
          rowDataTransformer: config.rowDataTransformer
        });
    return grid;
  };
})(jQuery);
