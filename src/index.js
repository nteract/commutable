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
    readNotebook(filepath, options, (err, nb) => {
      if (err) {
        reject(err);
      }
      const immnb = Immutable.fromJS(nb);
      resolve(immnb);
    });
  });
}
