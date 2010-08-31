(function($) {
  var scrollbarWidth = $.getScrollbarWidth(),
      sortDataKey = 'caruso.grid.sortData';

  var createGrid = function(config) {
    var $grid = $('<div class="caruso-grid" />'),
        $headerDiv = $('<div class="caruso-grid-head"><table><thead></thead><tbody></tbody></table></div>'),
        $head = $headerDiv.find('thead'),
        $bodyDiv = $('<div class="caruso-grid-body"><table><tbody></tbody></table></div>'),
        $bodyTable = $bodyDiv.find('table'),
        $body = $bodyDiv.find('tbody');

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
      var $p = $('<div />');
      $.each(data, function() {
         $p.append(config.model.$dataRow.clone().inject(this));
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

  $.fn.carusoGrid = function carusoGrid(dataSource) {
    var model = createModel(this),
        dimensions = {
          height: this.height(),
          width: this.width()
        },
        grid = createGrid({
          dataSource: dataSource,
          dimensions: dimensions,
          model: model,
          $placeholder: this
        });
  };
})(jQuery);
