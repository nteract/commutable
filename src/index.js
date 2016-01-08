import Immutable from 'immutable';

export function fromJS(notebook) {
  // TODO: Don't mutate the notebook that was provided, rely on ImmutableJS
  //       early on.

  // Convert the multiline strings from a raw v4 notebook so we have a nice
  // consistent structure for Immutable.JS
  for(const cell of notebook.cells) {
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
  const immnb = Immutable.fromJS(notebook);
  return immnb;
}
