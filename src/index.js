import Immutable from 'immutable';

function cleanMultiline(item) {
  if (item instanceof Immutable.List) {
    return item.join('');
  }
  return item;
}

function demultilineOutputData(data) {
  // If data is undefined, we just return it back
  return data ? data.map(cleanMultiline) : data;
}

function demultilineOutputs(outputs) {
  // If outputs is undefined, we just return it back
  return outputs ? outputs.map(output => {
    return output.update('text', cleanMultiline)
                 .update('data', demultilineOutputData);
  }) : outputs;
}

/**
 * Concatenate all "multi-line" strings from a cell (on disk -> in-mem format)
 * @param {Immutable.Map} cell the cell to clean up
 * @return {Immutable.Map} cell without multi-line strings
 */
function demultilineCell(cell) {
  return cell.update('source', cleanMultiline)
             .update('outputs', demultilineOutputs);
}

function demultilineCells(cells) {
  return cells.map(demultilineCell);
}

/**
 * Trims all "multi-line" strings from a notebook (on disk format -> in-memory)
 * @param {commutable.Notebook} nb notebook
 * @return {commutable.Notebook} notebook without multi-line strings
 */
function demultilineNotebook(nb) {
  return nb.update('cells', demultilineCells);
}

export function fromJS(notebookJSON) {
  const immnb = Immutable.fromJS(notebookJSON);
  return demultilineNotebook(immnb);
}
