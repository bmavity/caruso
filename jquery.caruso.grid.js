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
        $body = $bodyDiv.find('tbody');

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
          $row;
      $.each(data, function() {
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

    $bodyDiv.click(function(evt) {
      var $clickedCell = $(evt.target).closest('td.expand'),
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
    });

    config.$placeholder.replaceWith($grid);
    config.dataSource.getData(setData);
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
          detail: {
            dataSource: {
              getData: config.detail.getData
            },
            model: createDetailModel(config.detail.model)
          },
          dimensions: dimensions,
          model: model,
          $placeholder: this
        });
  };
})(jQuery);
