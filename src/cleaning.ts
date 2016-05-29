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
 * Break all "multi-line" strings into a list
 * @param {Immutable.List|string} item to join
 * @return {string} plain ol' string
 */
function breakIntoMultiline(item) {
  // Use positive lookahead regex to split on newline and retain newline char
  return typeof item === 'string' ? item.split(/(.+?(?:\r\n|\n))/g).filter(x => x !== '') : item;
}

/**
 * Concatenate all "multi-line" strings from a cell's data section
 * @param {Function} processor, map function applied to values
 * @param {Immutable.Map} data display data possibly in need of cleaning
 * @return {Immutable.Map} display data without multi-line strings
 */
function processOutputData(processor, data) {
  // If data is undefined, we just return it back
  return data ? data.map(processor) : data;
}

/**
 * Concatenate all "multi-line" strings from a cell's outputs
 * @param {Function} processor, map function applied to values
 * @param {Immutable.Map} outputs a cell's outputs
 * @return {Immutable.Map} cell outputs without multi-line strings
 */
function processOutputs(processor, outputs) {
  // If outputs is undefined, we just return it back
  return outputs ? outputs.map(output =>
    output.update('text', processor)
          .update('data', processOutputData.bind(this, processor))
  ) : outputs;
}

/**
 * Concatenate all "multi-line" strings from a cell (on disk -> in-mem format)
 * @param {Function} processor, map function applied to values
 * @param {Immutable.Map} cell the cell to clean up
 * @return {Immutable.Map} cell without multi-line strings
 */
function processCell(processor, cell) {
  return cell.update('source', processor)
             .update('outputs', processOutputs.bind(this, processor));
}

/**
 * Concatenate all "multi-line" strings from a cell
 * @param {Function} processor, map function applied to values
 * @param {Immutable.List} cells the cell to clean up
 * @return {Immutable.Map} cell without multi-line strings
 */
function processCells(processor, cells) {
  return cells.map(processCell.bind(this, processor));
}

/**
 * Concatenate all "multi-line" strings from a notebook (on disk format -> in-memory)
 * @param {Immutable.Map} nb notebook
 * @return {Immutable.Map} notebook without multi-line strings
 */
export function cleanMultilineNotebook(nb) {
  return nb.update('cells', processCells.bind(this, cleanMultiline));
}


/**
 * Breaks long lines of the notebook into multiple lines to make opening the
 * JSON files in a text editor directly a better experience.
 * @param  {Immutable.Map} nb
 * @return {Immutable.Map} nb
 */
export function makeMultilineNotebook(nb) {
  return nb.update('cells', processCells.bind(this, breakIntoMultiline));
}
