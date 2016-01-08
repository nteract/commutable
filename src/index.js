import Immutable from 'immutable';

/**
 * Trims all "multi-line" strings from a notebook (on disk format -> in-memory)
 * @param {commutable.Notebook} nb notebook
 * @return {commutable.Notebook} notebook without multi-line strings
 */
function demultilineCells(nb) {
  return nb;
}

export function fromJS(notebookJSON) {
  // Convert the multiline strings from a raw v4 notebook so we have a nice
  // consistent structure for Immutable.JS
  for(const cell of notebookJSON.cells) {
    if(cell.source) {
      if(Array.isArray(cell.source)) {
        cell.source = cell.source.join('');
      }
    }
    if(cell.outputs) {
      for(const output of cell.outputs) {
        if(output.output_type === 'stream') {
          if(Array.isArray(output.text)) {
            output.text = output.text.join('');
          }
        }
        if (output.data) {
          for (const mimetype in output.data) {
            if (Array.isArray(output.data[mimetype])) {
              output.data[mimetype] = output.data[mimetype].join('');
            }
          }
        }
      }
    }
  }
  const immnb = Immutable.fromJS(notebookJSON);
  return demultilineCells(immnb);
}
