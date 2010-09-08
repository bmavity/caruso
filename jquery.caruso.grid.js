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
    
    var expandClickHandler = {
      handles: function($target) {
        return $target.closest('td.caruso-expand').length === 1;
      },
      handle: function($target) {
        var $clickedCell = $target.closest('td.caruso-expand'),
            $clickedRow = $clickedCell.closest('tr'),
            clickedRowIsSelected = $clickedRow.hasClass('caruso-selected'),
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
                if(clickedRowIsSelected) {
                  $populatedRow.addClass('caruso-selected');
                }
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
      var selectedRowClassName = 'caruso-selected',
          selectedRowSelector = 'tr.' + selectedRowClassName,
          that = {};

      var partiallySelectedRowClassName = 'caruso-partially-selected',
          partiallySelectedRowSelector = 'tr.' + partiallySelectedRowClassName;

      var deselectAll = function() {
        $selectedRows = $bodyTable.find(selectedRowSelector + ', ' + partiallySelectedRowSelector);
        $selectedRows.removeClass(partiallySelectedRowClassName);
        $selectedRows.removeClass(selectedRowClassName);
        if(config.rowDeselectedHandler) {
          $selectedRows.each(function() {
            config.rowDeselectedHandler($(this).data(rowDataKey));
          });
        }
      };
      that.deselectAll = deselectAll;

      that.selectAll = function() {
        var $visibleNonDetailRows = $bodyTable.find('tr').not('tr.caruso-detail_row');
        $visibleNonDetailRows.addClass(selectedRowClassName);
      };
      
      that.getSelected = function() {
        var $selectedRows,
            $fullySelectedRows,
            $partiallySelectedRows,
            results = [];
        if(config.detail) {
          $fullySelectedRows = $body.children(selectedRowSelector);
          $partiallySelectedRows = $body.children(partiallySelectedRowSelector);
          $fullySelectedRows.each(function() {
            results.push({
              master: $(this).data(rowDataKey),
              details: []
            });
          });
          $partiallySelectedRows.each(function() {
            var $this = $(this),
                $detailParentRow = $this.next('tr.caruso-detail-row'),
                $detailBody = $detailParentRow.find('tbody'),
                $detailRows = $detailBody.children(selectedRowSelector);
            results.push({
              master: $this.data(rowDataKey),
              details: $.map($detailRows, function(row) {
                return $(row).data(rowDataKey);
              })
            });
          });
          return results;
        } else {
          $selectedRows = $bodyTable.find(selectedRowSelector);
          return $.map($selectedRows, function(row) {
            return $(row).data(rowDataKey);
          });
        }
      };
      
      that.handles = function($target) {
        return $target.closest('tr').length === 1;
      };

      that.handle = function($target, evt) {
        var $clickedRow = $target.closest('tr'),
            rowIsSelected = $clickedRow.hasClass(selectedRowClassName),
            $detailRow = $clickedRow.next('tr.caruso-detail-row'),
            rowHasDetails = $detailRow.length !== 0;

        var $clickedDetailRow = $target.closest('tr.caruso-detail-row'),
            isDetailRow = $clickedDetailRow.length !== 0,
            $correspondingMasterRow = $clickedDetailRow.prev('tr');

        var deselectDetailRows = function() {
          $detailRow.find('tbody tr').removeClass(selectedRowClassName);
          if(config.rowDeselectedHandler) {
            $detailRows.each(function() {
              config.rowDeselectedHandler($(this).data(rowDataKey));
            });
          }
        };

        var selectDetailRows = function() {
          var $detailRows = $detailRow.find('tbody tr').addClass(selectedRowClassName);
          if(config.rowSelectedHandler) {
            $detailRows.each(function() {
              config.rowSelectedHandler($(this).data(rowDataKey));
            });
          }
        };

        var deselectRow = function() {
          $clickedRow.removeClass(selectedRowClassName);
          if(config.rowDeselectedHandler) {
            config.rowDeselectedHandler($clickedRow.data(rowDataKey));
          }
          if(rowHasDetails) {
            deselectDetailRows();
          } else if(isDetailRow) {
            $correspondingMasterRow.removeClass(selectedRowClassName);
            if($clickedRow.siblings(selectedRowSelector).length !== 0) {
              $correspondingMasterRow.addClass(partiallySelectedRowClassName);
            }
          }
        };

        var selectRow = function() {
          $clickedRow.removeClass(partiallySelectedRowClassName);
          $clickedRow.addClass(selectedRowClassName);
          if(config.rowSelectedHandler) {
            if(isDetailRow) {
              config.rowSelectedHandler({
                detail: $clickedRow.data(rowDataKey),
                master: $correspondingMasterRow.data(rowDataKey)
              });
            } else {
              config.rowSelectedHandler($clickedRow.data(rowDataKey));
            }
          }
          if(rowHasDetails) {
            selectDetailRows();
          } else if(isDetailRow) {
            if($clickedRow.siblings().not(selectedRowSelector).length === 0) {
              $correspondingMasterRow.removeClass(partiallySelectedRowClassName);
              $correspondingMasterRow.addClass(selectedRowClassName);
            } else {
              $correspondingMasterRow.addClass(partiallySelectedRowClassName);
            }
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
    that.selectAll = selectClickHandler.selectAll;

    var bodyHandlers = [expandClickHandler, sortExtension, selectClickHandler];

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

      args.push(setData);
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
          rowDeselectedHandler: config.rowDeselectedHandler,
          rowDataTransformer: config.rowDataTransformer
        });
    return grid;
  };
})(jQuery);
