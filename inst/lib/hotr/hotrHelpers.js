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
  const ncols = d[0].length;
  const letter_ids = letters.slice(0, ncols);
  const data = d.slice(sliceInit);
  // var dic = d.slice(0, sliceInit).concat([letter_ids]);

  // function transpose(matrix) {
  //   return matrix[0].map((col, i) => matrix.map(row => row[i]));
  // }

  // function dicToDataframe(arr) {
  //   // console.log("dicToDataframe Arr", arr)
  //   const dicKeys = enable_hdTypes ? ['hdType', 'label', 'id'] : ['label', 'id']
  //   return arrayToObj(transpose(arr), dicKeys);
  // }

  function arrayToObj(arr, keys) {
    return arr.map(function (x) {
      const obj = x.reduce(function (acc, cur, i) {
        acc[keys[i]] = cur;
        return acc;
      }, {});
      return obj;
    });
  }

  return {
    data: arrayToObj(data, letter_ids),
    dic: dc.map((record, i) => ({
      hdType: record.hdType,
      label: record.label,
      id: letters[i]
    })),
    selectedCols: userSelectedCols
  };
}
