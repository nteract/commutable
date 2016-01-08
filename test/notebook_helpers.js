import fs from 'fs';

export function readJSON(filepath) {
  return new Promise((resolve, reject) => {
    return fs.readFile(filepath, {}, (err, data) => {
      if(err) {
        reject(err);
        return;
      }
      try {
        const nb = JSON.parse(data);
        resolve(nb);
        return;
      }
      catch (e) {
        reject(e);
      }
    });
  });
}
