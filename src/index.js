import fs from 'fs';

import Immutable from 'immutable';

function readNotebook(filepath, options, callback) {
  return fs.readFile(filepath, options, (err, data) => {
    if(err) {
      callback(err, null);
      return;
    }
    try {
      const nb = JSON.parse(data);
      callback(err, nb);
      return;
    }
    catch (e) {
      callback(e, null);
    }
  });
}

export function readImmutableNotebook(filepath, options) {
  return new Promise((resolve, reject) => {
    readNotebook(filepath, options, (err, notebook) => {
      if (err) {
        reject(err);
      }

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
      resolve(immnb);
    });
  });
}
