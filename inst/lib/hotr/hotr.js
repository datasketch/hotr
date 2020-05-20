let hotrBinding = new Shiny.InputBinding();
let handleSubscribe = null;

hotrBinding = Object.assign(hotrBinding, {
  find: function(scope) {
    return $(scope).find('.hot');
  },
  initialize: function(el) {
    const params = formatDataParams(el);
    el.dataset.enable_hdTypes = params.hotOpts.enable_hdTypes;
    el.dataset.headers = JSON.stringify(params.dataHeaders);
    el.dataset.userSelectedColums = JSON.stringify([]);

    const hotSettings = {
      licenseKey: 'non-commercial-and-evaluation',
      data: params.hotOpts.enable_hdTypes
        ? params.dataHeaders.concat(params.dataObject)
        : [params.dataHeaders[1]].concat(params.dataObject),
      columns: params.dataDic,
      manualRowMove: params.hotOpts.manualRowMove,
      manualColumnMove: params.hotOpts.manualColumnMove,
      width:
        params.hotOpts.width ||
        $(el)
          .parent()
          .parent()
          .width(),
      height:
        params.hotOpts.height ||
        $(el)
          .parent()
          .parent()
          .height(),
      // 23px is the default height defined by Handsontable
      minSpareRows:
        Math.floor(
          $(el)
            .parent()
            .parent()
            .height() / 23
        ) - params.dataObject.length,
      stretchH: 'all',
      rowHeaders: function(index) {
        if (!params.hotOpts.enable_hdTypes) {
          return !index ? '' : index;
        }
        return (!index || index === 1) ? '' : index - 1;
      },
      colHeaders: true,
      // dropdownMenu: true,
      // filters: true,
      fixedRowsTop: params.hotOpts.enable_hdTypes ? 2 : 1,
      manualColumnFreeze: true, // Needed for context menu's freeze_column and unfreeze_column options to work
      contextMenu: [
        'row_above',
        'row_below',
        '---------',
        'remove_row',
        '---------',
        'undo',
        'redo',
        'alignment',
        '---------',
        'freeze_column',
        'unfreeze_column'
      ],
      // columnSorting: true,
      // sortIndicator: true,
      cells: function(row, col, prop) {
        if (row === 0) {
          if (!params.hotOpts.enable_hdTypes) {
            this.renderer = headRenderer;
            this.validator = null;
            return this;
          }
          this.renderer = hdTypeRenderer;
          this.type = 'dropdown';
          this.source = params.hotOpts.hdTypes;
          this.validator = null;
          return this;
        }
        if (row === 1) {
          if (!params.hotOpts.enable_hdTypes) {
            return this;
          }
          this.renderer = headRenderer;
          this.validator = null;
          return this;
        }
        // Get current hdType
        var hdType = this.instance.getDataAtCell(0, col);
        if (hdType == 'Num') {
          this.validator = valiNumeric;
        }
        if (hdType == 'Cat') {
          this.validator = valiCategoric;
        }
        if (hdType == 'Dat') {
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
        // Filter dictionary and save under data-user-selected-columns el attr
        const userSelectedColums = filterDict.apply(this, [selected]);
        el.dataset.userSelectedColums = JSON.stringify(userSelectedColums);
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
    window[el.id] = hot;
    window[el.id].validateCells();
  },
  getValue: function(el) {
    const enable_hdTypes = JSON.parse(el.dataset.enable_hdTypes);
    const headers = JSON.parse(el.dataset.headers);
    const userSelectedColums = JSON.parse(el.dataset.userSelectedColums);
    const hot = window[el.id];
    const data = enable_hdTypes
      ? hot.getData()
      : [Object.values(headers[0])].concat(hot.getData());
    return JSON.stringify(parseHotInput(data, userSelectedColums));
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
