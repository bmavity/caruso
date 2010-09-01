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
        that = {};

    if(config.detail) {
      config.model.$headerRow.prepend($('<th class="expand" />'));
    }
    $grid.height(config.dimensions.height);
    $grid.width(config.dimensions.width);
    $head.append(config.model.$headerRow);
    $grid.append($headerDiv).append($bodyDiv);

    var setColumnWidths = function() {
      var lastColumnWidth = $headerDiv.find('th:last-child').width();
      if($bodyDiv.height() < $bodyTable.height()) {
        $bodyTable.width($grid.width() - scrollbarWidth);
        $grid.find('td:last-child').width(lastColumnWidth - scrollbarWidth);
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
        if(config.detail) {
          $row.prepend($('<td class="expand" />'));
        }
        $p.append($row);
      });
      $body.empty().append($p.children());
      setColumnWidths();
    };
    
    $headerDiv.click(function(evt) {
      var $clickedHeader = $(evt.target).closest('th'),
          sortItem = $clickedHeader.length && $clickedHeader.data(sortDataKey);

      if(sortItem) {
        sortItem.direction = sortItem.direction === 'asc' ? 'desc' : 'asc';
        config.dataSource.getData(sortItem, setData);
      };
    });

    var expandClickHandler = {
      handles: function($target) {
        return $target.closest('td.expand').length === 1;
      },
      handle: function($target) {
        var $clickedCell = $target.closest('td.expand'),
            $clickedRow = $clickedCell.closest('tr'),
            $detailRow = $clickedRow.next('.caruso-detail-row');
        if($clickedCell.length) {
          if($detailRow.length) {
            if($detailRow.is(':visible')) {
              $detailRow.hide();
            } else {
              $detailRow.show();
            }
          } else {
            $detailRow = $('<tr class="caruso-detail-row"><td colspan="' + (config.model.$dataRow.children().length + 1) + '" class="caruso-detail-cell" /></tr>');
            $detailCell = $detailRow.find('td');
            $detailTable = $('<table><tbody /></table>');
            $detailBody = $detailTable.find('tbody');
            $detailCell.append($detailTable);
            config.detail.dataSource.getData($clickedRow.data(rowDataKey), function(a) {
              $.each(a, function() {
                $detailBody.append(config.detail.model.$dataRow.clone().inject(this));
              });
            });
            $clickedRow.after($detailRow);
          }
        }
      }
    };

    var selectClickHandler = {
      handles: function($target) {
        return $target.closest('tr').length === 1;
      },
      handle: function($target) {
        var $selectedRow = $target.closest('tr');
        $selectedRow.addClass('caruso-selected');
        if(!config.multiSelect) {
          $body.find('.caruso-selected').removeClass('caruso-selected');
        }
        if(config.rowSelectedHandler) {
          config.rowSelectedHandler($selectedRow.data(rowDataKey));
        }
      }
    };

    var bodyHandlers = [expandClickHandler, selectClickHandler];

    $bodyDiv.click(function(evt) {
      var $target = $(evt.target),
          matchingHandler = $.filterOne(bodyHandlers, function(handler) {
            return handler.handles($target);
          });
      matchingHandler.handle($target);
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
        direction: 'asc'
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
            model: createDetailModel(config.detail.model)
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
