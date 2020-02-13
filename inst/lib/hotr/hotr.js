const hotrBinding = new Shiny.InputBinding();
let handleSubscribe = null;
let state = { userSelectedColumns: null, hotInstance: null };

$.extend(hotrBinding, {
  find: function(scope) {
    return $(scope).find(".hot");
  },
  initialize: function(el) {
    const settings = {
      maxRows: 50,
      availableCtypes: ["Num", "Cat", "Dat", "Gnm", "Gcd"]
    };
    const rowsIdx = Array.from(new Array(settings.maxRows), function(
      val,
      index
    ) {
      return index + 1;
    });

    const params = formatDataParams(el);
    console.log("params", params);
    const hotSettings = {
      data: params.dataObject,
      columns: params.dataDic,
      stretchH: "all",
      width:
        params.hotOpts.width ||
        $(el)
          .parent()
          .width(),
      autoWrapRow: params.hotOpts.autoWrapRow,
      height:
        params.hotOpts.height ||
        $(el)
          .parent()
          .height(),
      maxRows: params.hotOpts.maxRows + 10,
      rowHeaders: ["", ""].concat(rowsIdx),
      colHeaders: true,
      fixedRowsTop: 2,
      manualRowMove: params.hotOpts.manualRowMove,
      manualColumnMove: params.hotOpts.manualColumnMove,
      manualColumnFreeze: true, // Needed for context menu's freeze_column and unfreeze_column options to work
      contextMenu: [
        "row_above",
        "row_below",
        "remove_row",
        "undo",
        "redo",
        "cut",
        "copy",
        "freeze_column",
        "unfreeze_column"
      ],
      selectionMode: "multiple",
      // invalidCellClassName: 'highlight--error',
      cells: function(row, col, prop) {
        // console.log(this);
        if (row === 0) {
          this.renderer = ctypeRenderer;
          this.type = "dropdown";
          this.source = settings.availableCtypes;
          this.validator = null;
          return this;
        }
        if (row === 1) {
          // console.log(row)
          this.renderer = headRenderer;
          this.validator = null;
          return this;
        }
        //Get current ctype
        var ctype = this.instance.getDataAtCell(0, col);
        if (ctype == "Num") {
          this.validator = valiNumeric;
        }
        if (ctype == "Cat") {
          this.validator = valiCategoric;
        }
        if (ctype == "Dat") {
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
        // Filter dictionary and save under global window object
        // Save under global window object
        state.userSelectedColums = filterDict.apply(this, [selected]);
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
      if (info.layer > 0) {
        // Each value represents a column
        info.columns.map(function(col) {
          let meta = self.getCellMeta(0, col);
          props.push(meta.prop);
        });
      } else {
        // The array represents a range
        const start = info.columns[0];
        const end = info.columns[1] || start;
        for (let i = start; i <= end; i++) {
          let meta = self.getCellMeta(0, i);
          props.push(meta.prop);
        }
      }
      return params.dataDic.filter(function(item) {
        return props.includes(item.id);
      });
    };
    const hot = new Handsontable(el, hotSettings);
    hot.validateCells();
    state.hotInstance = hot;
  },
  getValue: function(el) {
    const hot = state.hotInstance;
    const userSelectedCols = state.userSelectedColums;
    console.log("selectedCols", state.userSelectedColums);
    return JSON.stringify(parseHotInput(hot.getData(), userSelectedCols));
  },
  subscribe: function(el, callback) {
    handleSubscribe = function(event) {
      callback();
    };
    el.addEventListener("change", handleSubscribe);
    el.addEventListener("click", handleSubscribe);
  },
  unsubscribe: function(el) {
    el.removeEventListener("change", handleSubscribe);
    el.removeEventListener("click", handleSubscribe);
  },
  getType: function() {
    return "hotrBinding";
  }
});

Shiny.inputBindings.register(hotrBinding);
