function generateColumnsLetters() {
  const createAlphabet = prefix => [...Array(26)].map((_, i) => `${prefix ? prefix : ''}${String.fromCharCode(i + 65)}`.toLowerCase());

  let colsLetters = createAlphabet();
  const pivot = colsLetters.slice();

  for (let i = 0; i < pivot.length; i++) {
    const level = createAlphabet(colsLetters[i]);
    colsLetters = [...colsLetters, ...level];
  }

  return colsLetters;
}

function extractColumn(arr, column) {
  return arr.map(x => x[column]);
}

function orig_idx_of_new_col_names(new_cols, old_cols){
  
	var orig_idx = [];
  
    for (var i = 0; i < new_cols.length; i++) {
        col_name = new_cols[i];
        idx_in_old_col_names = old_cols.indexOf(col_name);
        orig_idx.push(idx_in_old_col_names);
    }
  return orig_idx;
}

function create_new_dic (new_cols, old_cols, dic_old) {

  const old_idx = orig_idx_of_new_col_names(new_cols, old_cols);
  const letters = generateColumnsLetters();

  var dic_new = [];
  
  for (var j = 0; j < old_idx.length; j++) {
        k = old_idx[j];
        if(k === -1){ 
          label = new_cols[j];
          hdType = dic_old[j].hdType;
        } else {
          label = dic_old[k].label;
          hdType = dic_old[k].hdType;
        }
        dic_new[j] = {hdType: hdType, label: label, id: letters[j]};
    }
  
  return dic_new;
}

// More renderers https://handsontable.com/blog/articles/getting-started-with-cell-renderers
const hdTypeRenderer = function (
  instance,
  td,
  row,
  col,
  prop,
  value,
  cellProperties
) {
  Handsontable.renderers.DropdownRenderer.apply(this, arguments);
  td.className = 'table-hdType';
};

// https://docs.handsontable.com/5.0.1/tutorial-cell-types.html
const headRenderer = function (
  instance,
  td,
  row,
  col,
  prop,
  value,
  cellProperties
) {
  Handsontable.renderers.TextRenderer.apply(this, arguments);
  td.className = 'table-header';
};

invalidRenderer = function (
  instance,
  td,
  row,
  col,
  prop,
  value,
  cellProperties
) {
  Handsontable.renderers.TextRenderer.apply(this, arguments);
  // td.style.backgroundColor = '#F00!important';
  td.className = 'invalidCell';
};
// var valiNumeric = /[0-9]/g;
var valiNumeric = function (value, callback) {
  if (/[0-9]/g.test(value)) {
    callback(true);
  } else {
    callback(false);
  }
};

var valiCategoric = function (value, callback) {
  if (/[a-z]/g.test(value)) {
    callback(true);
  } else {
    callback(false);
  }
};

var valiDate = function (value, callback) {
  if (
    /^(?:[1-9]\d{3}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\d|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[1-9]\d(?:0[48]|[2468][048]|[13579][26])|(?:[2468][048]|[13579][26])00)-02-29)T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:Z|[+-][01]\d:[0-5]\d)$/.test(
      value
    )
  ) {
    callback(true);
  } else {
    callback(false);
  }
};

Handsontable.validators.registerValidator('valiNumeric', valiNumeric);
Handsontable.validators.registerValidator('valiCategoric', valiCategoric);
Handsontable.validators.registerValidator('valiDate', valiDate);

function createDic(data){
	

}

function formatDataParams(el) {
  const dataDic = JSON.parse(el.dataset.dic);
  const dataInput = JSON.parse(el.dataset.table);
  const hotOpts = JSON.parse(el.dataset.hotopts);
  let dataHeaders = [];
  dataHeaders[0] = dataDic.slice().reduce(function (final, item) {
    item.data = item.id_letter;
    final[item.data] = item.hdType;
    return final;
  }, {});
  dataHeaders[1] = dataDic.slice().reduce(function (final, item) {
    item.data = item.id_letter;
    final[item.data] = item.label;
    return final;
  }, {});

  const dataObject = dataInput;

  return {
    dataDic: dataDic,
    dataHeaders: dataHeaders,
    dataObject: dataObject,
    hotOpts: hotOpts
  };
}

function parseHotInput(d, enable_hdTypes, userSelectedCols, dc) {
  const sliceInit = enable_hdTypes ? 2 : 1;

  const letters = generateColumnsLetters();
  const cols = d[0];
  const ncols = cols.length;
  const letter_ids = letters.slice(0, ncols);
  const data = d.slice(sliceInit);

  const cols_old = extractColumn(dc, "label");
  //alert(orig_idx_of_new_col_names(cols, cols_old));
  //alert(create_new_dic(cols, cols_old, dc));

  function arrayToObj(arr, keys) {
    return arr.map(function (x) {
      const obj = x.reduce(function (acc, cur, i) {
        acc[keys[i]] = cur;
        return acc;
      }, {});
      return obj;
    });
  }

  //const dic = dc.map((record, i) => ({
  //    hdType: record.hdType,
  //    label: record.label,
  //    id: letters[i]
  //  }));

  const dic = create_new_dic(cols, cols_old, dc);

  return {
    data: arrayToObj(data, letter_ids),
    dic: dic,
    selectedCols: userSelectedCols
  };
}
