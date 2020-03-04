let hotrBinding = new Shiny.InputBinding();
let handleSubscribe = null;
let state = {
  userSelectedColumns: null,
  hotInstance: null,
  headers: null,
  enableCTypes: null
};

hotrBinding = Object.assign(hotrBinding, {
  find: function(scope) {
    return $(scope).find('.hot');
  },
  initialize: function(el) {
    const params = formatDataParams(el);
    state.enableCTypes = params.hotOpts.enableCTypes;
    state.headers = params.dataHeaders;
    console.log('params', params);
    const hotSettings = {
      licenseKey: 'non-commercial-and-evaluation',
      data: state.enableCTypes
        ? state.headers.concat(params.dataObject)
        : [state.headers[1]].concat(params.dataObject),
      columns: params.dataDic,
      manualRowMove: params.hotOpts.manualRowMove,
      manualColumnMove: params.hotOpts.manualColumnMove,
      width:
        params.hotOpts.width ||
        $(el)
          .parent()
          .width(),
      height:
        params.hotOpts.height ||
        $(el)
          .parent()
          .height(),
      // 23px is the default height defined by Handsontable
      minSpareRows:
        Math.floor(
          $(el)
            .parent()
            .height() / 23
        ) - params.dataObject.length,
      stretchH: 'all',
      rowHeaders: true,
      colHeaders: true,
      dropdownMenu: true,
      filters: true,
      fixedRowsTop: 2,
      manualColumnFreeze: true, // Needed for context menu's freeze_column and unfreeze_column options to work
      contextMenu: true,
      columnSorting: true,
      sortIndicator: true,
      cells: function(row, col, prop) {
        if (row === 0) {
          if (!state.enableCTypes) {
            this.renderer = headRenderer;
            this.validator = null;
            return this;
          }
          this.renderer = ctypeRenderer;
          this.type = 'dropdown';
          this.source = params.hotOpts.ctypes;
          this.validator = null;
          return this;
        }
        if (row === 1) {
          if (!state.enableCTypes) {
            return this;
          }
          this.renderer = headRenderer;
          this.validator = null;
          return this;
        }
        // Get current ctype
        var ctype = this.instance.getDataAtCell(0, col);
        if (ctype == 'Num') {
          this.validator = valiNumeric;
        }
        if (ctype == 'Cat') {
          this.validator = valiCategoric;
        }
        if (ctype == 'Dat') {
          this.validator = valiDate;
        }
      },
      // Bind event after selection
      afterSelectionEnd: function(
        startRow,
        startColumn,
        endRow,
        endColumn,
        layer
      ) {
        if (startRow !== 0) {
          return;
        }
        var selected = {};
        // If greater than 0, the user selected multiple columns using CTRL key
        selected.layer = layer;
        selected.columns = this.getSelected().reduce(function(cols, range) {
          cols.push(range[1]); // Start column
          cols.push(range[3]); // End column
          return cols;
        }, []);
        // Unique values
        selected.columns = selected.columns.reduce(function(cols, col) {
          // Short-circuit evaluation
          !cols.includes(col) && cols.push(col);
          return cols;
        }, []);
        // Filter dictionary and save under global state object
        state.userSelectedColums = filterDict.apply(this, [selected]);
        console.log(state.userSelectedColums);
      },
      afterChange: function onChange(changes, source) {
        if (!changes) {
          return;
        }
        const instance = this;
        changes.forEach(function(change) {
          const row = change[0];
          const col = change[1];
          const colIdx = instance.propToCol(col);
          if (row === 0) {
            instance.validateColumns([colIdx]);
          }
        });
      }
    };
    var filterDict = function(info) {
      const props = [];
      const self = this;
      info.columns.map(function(col) {
        let meta = self.getCellMeta(0, col);
        props.push(meta.prop);
      });
      return params.dataDic.filter(function(item) {
        return props.includes(item.id);
      });
    };
    const hot = new Handsontable(el, hotSettings);
    state.hotInstance = hot;
    state.hotInstance.validateCells();
  },
  getValue: function(el) {
    const hot = state.hotInstance;
    const userSelectedCols = state.userSelectedColums;
    const data = state.enableCTypes
      ? hot.getData()
      : [Object.values(state.headers[0])].concat(hot.getData());
    console.log(userSelectedCols);
    console.log(data);
    return JSON.stringify(parseHotInput(data, userSelectedCols));
  },
  subscribe: function(el, callback) {
    handleSubscribe = function(event) {
      callback();
    };
    el.addEventListener('change', handleSubscribe);
    el.addEventListener('click', handleSubscribe);
  },
  unsubscribe: function(el) {
    el.removeEventListener('change', handleSubscribe);
    el.removeEventListener('click', handleSubscribe);
  },
  getType: function() {
    return 'hotrBinding';
  }
});

Shiny.inputBindings.register(hotrBinding);
