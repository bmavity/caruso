(function($) {
  var createBodyRowDataExtension = function(body) {
    var rowDataKey = 'caruso.grid.rowData',
        that = {};

    var handleDeselected = function(deselectedEvt) {
      deselectedEvt.rowData = deselectedEvt.$row.data(rowDataKey);
    };
    
    var handleSelected = function(selectedEvt) {
      selectedEvt.rowData = selectedEvt.$row.data(rowDataKey);
    };

    var mutateRowData = function(rowData) {
      rowData.$row.data(rowDataKey, rowData);
    };

    var existingRowExtension = (function() {
      var that = {};

      var addExistingRow = function(rowData) {
        var $rows = body.$ele.find('tbody > tr'),
            key = rowData.data.key,
            data,
            itemToUpdate;
        if(key) {
          rowData.$row = $rows.filterOne(function($row) {
            data = $row.data(rowDataKey);
            itemToUpdate = data.originalData || data.data;
            return itemToUpdate[key.name] === key.val;
          });
          rowData.updateData = rowData.data;
          rowData.data = $.extend(itemToUpdate, rowData.data.data);
        }
      };

      var findExistingRow = function(itemOrIndex) {
        var $rows = body.$ele.find('tbody > tr'),
            key = itemOrIndex.key;
        if(key) {
          return $rows.filterOne(function($row) {
            var rowData = $row.data(rowDataKey),
                data = rowData.originalData || rowData.data;
            return data[key.name] === key.val;
          });
        }
        return itemOrIndex;
      };

      that.findExistingRow = findExistingRow;
      that.mutateRowData = addExistingRow;
      return that;
    })();

    that.existingRowExtension = existingRowExtension;
    that.handleDeselected = handleDeselected;
    that.handleSelected = handleSelected;
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

  var createSelectionExtension = function(body, activeSelectedHandlers, activeDeselectedHandlers, selectionBehavior) {
    var selectedRowAttribute = 'carusoselected',
        selectedRowSelector = 'tr[' + selectedRowAttribute + ']',
        selectionBehaviors = {},
        selectedHandlers = {},
        deselectedHandlers = {},
        that = {};

    var addDeselectedHandler = function(name, handler) {
      deselectedHandlers[name] = handler;
    };

    var addSelectedHandler = function(name, handler) {
      selectedHandlers[name] = handler;
    };

    var canHandle = function($target) {
      return $target.closest('tr').length === 1;
    };

    var deselectAll = function() {
      getSelected().each(function() {
        deselectRow($(this));
      });
    };

    var deselectRow = function($row) {
      var deselectData = { $row: $row };
      $row.removeAttr(selectedRowAttribute);
      activeDeselectedHandlers.forEach(function(handlerName) {
        deselectedHandlers[handlerName].handleDeselected(deselectData);
      });
    };

    var getSelected = function() {
      return body.$ele.find(selectedRowSelector);
    };
    
    var handle = function(carusoEvt) {
      var $target = carusoEvt.$target;
      if(canHandle($target)) {
        selectionBehaviors[selectionBehavior]($target.closest('tr'), carusoEvt);
      }
    };

    var multiSelect = function($clickedRow, carusoEvt) {
      var rowIsSelected = $clickedRow.attr(selectedRowAttribute),
          isMetaKey = carusoEvt.originalEvent.metaKey;
      if(isMetaKey) {
        if(rowIsSelected) {
          deselectRow($clickedRow);
        } else {
          selectRow($clickedRow);
        }
      } else {
        if(!rowIsSelected) {
          deselectAll();
          selectRow($clickedRow);
        }
      }
    };

    var removeSelected = function() {
      getSelected().remove();
    };

    var selectAll = function() {
      body.$ele.find('tr').each(function() {
        selectRow($(this));
      });
    };

    var selectRow = function($row) {
      var selectData = { $row: $row };
      $row.attr(selectedRowAttribute, selectedRowAttribute);
      activeSelectedHandlers.forEach(function(handlerName) {
        selectedHandlers[handlerName].handleSelected(selectData);
      });
    };

    var selectNextRow = function() {
      var $selectedRow = getSelected(),
          $nextRow = $selectedRow.next('tr');
      if($selectedRow.length === 1 && $nextRow.length === 1) {
        deselectRow($selectedRow);
        selectRow($nextRow);
      }
    };

    var selectPreviousRow = function() {
      var $selectedRow = getSelected(),
          $previousRow = $selectedRow.prev('tr');
      if($selectedRow.length === 1 && $previousRow.length === 1) {
        deselectRow($selectedRow);
        selectRow($previousRow);
      }
    };

    var singleSelect = function($clickedRow) {
      var rowIsSelected = $clickedRow.attr(selectedRowAttribute);
      if(!rowIsSelected) {
        deselectAll();
        selectRow($clickedRow);
      }
    };

    var setSelectedRow = function($rowOrIndex) {
      var isJQuery = $rowOrIndex instanceof jQuery,
          $row;
      if(isJQuery) {
        $row = $rowOrIndex;
      } else {
        $row = body.$ele.find('tr:eq(' + $rowOrIndex + ')');
      }
      selectionBehaviors[selectionBehavior]($row);
    };

    var toggleSelect = function($clickedRow) {
      var rowIsSelected = $clickedRow.attr(selectedRowAttribute);
      if(rowIsSelected) {
        deselectRow($clickedRow);
      } else {
        selectRow($clickedRow);
      }
    };

    selectionBehaviors['multi'] = multiSelect;
    selectionBehaviors['single'] = singleSelect;
    selectionBehaviors['toggle'] = toggleSelect;

    that.addDeselectedHandler = addDeselectedHandler; 
    that.addSelectedHandler = addSelectedHandler;
    that.deselectAll = deselectAll;
    that.getSelected = getSelected;
    that.handle = handle;
    that.removeSelected = removeSelected;
    that.selectAll = selectAll;
    that.selectNextRow = selectNextRow;
    that.selectPreviousRow = selectPreviousRow;
    that.setSelectedRow = setSelectedRow;
    return that;
  };

  var createClassNameSelectionHandler = function() {
    var selectedRowClassName = 'caruso-grid-selected',
        that = {};

    var handleDeselected = function(deselectedEvt) {
      var $clickedRow = deselectedEvt.$row;
      $clickedRow.removeClass(selectedRowClassName);
    };

    var handleSelected = function(selectedEvt) {
      var $clickedRow = selectedEvt.$row;
      $clickedRow.addClass(selectedRowClassName);
    };

    that.handleDeselected = handleDeselected;
    that.handleSelected = handleSelected;
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
      $dummyParent.append(createRowData(data).$row);
    };

    var beginBatch = function() {
      $dummyParent = $('<div />');
    };

    var createRowData = function(data) {
      var rowData = { data: data };
      activeDataMutators.forEach(function(mutatorName) {
        dataMutators[mutatorName].mutateRowData(rowData);
      });
      return rowData;
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
            originalEvent: evt
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

    dataSource.onDataUpdated(function(updateParams) {
      createRowData(updateParams);
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
      rowData.$row = rowData.$row || $rowTemplate.clone();
      rowData.$row.inject(rowData.data);
    };

    that.mutateRowData = mutateRowData;
    return that;
  };

  $.fn.carusoGrid = function carusoGrid(config) {
    var $placeholder = $(this[0]),
        headClickHandlers = config.headClickHandlers || ['sortData'],
        headRowMutators = config.headRowMutators || ['defaultFactory', 'addSortData'],
        head = createHead(headClickHandlers, headRowMutators),
        bodyClickHandlers = config.bodyClickHandlers || ['rowSelect'],
        bodyRowMutators = config.bodyRowMutators || ['defaultFactory', 'addBodyRowData'],
        body = createBody(bodyClickHandlers, bodyRowMutators, config.dataSource, this.find('th:last-child').width()),
        sortExtension = createSortExtension(head, body, config.dataSource),
        selectedHandlers = config.selectedHandlers || ['className', 'addRowData'],
        deselectedHandlers = config.deselectedHandlers || ['className', 'addRowData'],
        selectionBehavior = config.selectionBehavior || 'single',
        selectionExtension = createSelectionExtension(body, selectedHandlers, deselectedHandlers, selectionBehavior),
        classNameSelectionHandler = createClassNameSelectionHandler(),
        rowDataExtension = createBodyRowDataExtension(body),
        grid;

    selectionExtension.addDeselectedHandler('className', classNameSelectionHandler);
    selectionExtension.addDeselectedHandler('addRowData', rowDataExtension);
    selectionExtension.addSelectedHandler('className', classNameSelectionHandler);
    selectionExtension.addSelectedHandler('addRowData', rowDataExtension);

    head.addClickHandler('sortData', sortExtension);
    head.addMutator('addSortData', sortExtension);
    head.addMutator('defaultFactory', createHeadRowFactory($placeholder));

    body.addClickHandler('rowSelect', selectionExtension);
    body.addMutator('addBodyRowData', rowDataExtension);
    body.addMutator('defaultFactory', createBodyRowFactory($placeholder));
    
    if(config.rowDataTransformer) {
      body.addMutator('transformer', { mutateRowData: config.rowDataTransformer });
      bodyRowMutators.unshift('transformer');
    }
    if(config.selectedHandler) {
      selectionExtension.addSelectedHandler('fromConfig', { handleSelected: config.selectedHandler });
      selectedHandlers.push('fromConfig');
    }
    if(config.deselectedHandler) {
      selectionExtension.addDeselectedHandler('fromConfig', { handleDeselected: config.deselectedHandler });
      deselectedHandlers.push('fromConfig');
    }

    body.addMutator('existingRow', rowDataExtension.existingRowExtension);
    bodyRowMutators.unshift('existingRow');

    grid = createGrid($placeholder, head, body);
    grid.deselectAll = selectionExtension.deselectAll;
    grid.removeSelected = selectionExtension.removeSelected;
    grid.selectAll = selectionExtension.selectAll;
    grid.selectNextRow = selectionExtension.selectNextRow;
    grid.selectPreviousRow = selectionExtension.selectPreviousRow;
    grid.setSelectedRow = function(itemOrIndex) {
      selectionExtension.setSelectedRow(rowDataExtension.existingRowExtension.findExistingRow(itemOrIndex));
    };
    return grid;
  };
})(jQuery);
