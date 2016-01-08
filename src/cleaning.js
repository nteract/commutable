import Immutable from 'immutable';

/**
 * Concatenate all "multi-line" strings if item is a list
 * @param {Immutable.List|string} item to join
 * @return {string} plain ol' string
 */
function cleanMultiline(item) {
  return item instanceof Immutable.List ? item.join('') : item;
}

/**
 * Concatenate all "multi-line" strings from a cell's data section
 * @param {Immutable.Map} data display data possibly in need of cleaning
 * @return {Immutable.Map} display data without multi-line strings
 */
function cleanMultilineOutputData(data) {
  // If data is undefined, we just return it back
  return data ? data.map(cleanMultiline) : data;
}

/**
 * Concatenate all "multi-line" strings from a cell's outputs
 * @param {Immutable.Map} outputs a cell's outputs
 * @return {Immutable.Map} cell outputs without multi-line strings
 */
function cleanMultilineOutputs(outputs) {
  // If outputs is undefined, we just return it back
  return outputs ? outputs.map(output => {
    return output.update('text', cleanMultiline)
                 .update('data', cleanMultilineOutputData);
  }) : outputs;
}

/**
 * Concatenate all "multi-line" strings from a cell (on disk -> in-mem format)
 * @param {Immutable.Map} cell the cell to clean up
 * @return {Immutable.Map} cell without multi-line strings
 */
function cleanMultilineCell(cell) {
  return cell.update('source', cleanMultiline)
             .update('outputs', cleanMultilineOutputs);
}

/**
 * Concatenate all "multi-line" strings from a cell
 * @param {Immutable.List} cells the cell to clean up
 * @return {Immutable.Map} cell without multi-line strings
 */
function cleanMultilineCells(cells) {
  return cells.map(cleanMultilineCell);
}

/**
 * Concatenate all "multi-line" strings from a notebook (on disk format -> in-memory)
 * @param {Immutable.Map} nb notebook
 * @return {Immutable.Map} notebook without multi-line strings
 */
export function cleanMultilines(nb) {
  return nb.update('cells', cleanMultilineCells);
}
