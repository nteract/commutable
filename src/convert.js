import { Map, fromJS } from 'immutable';

function _warnIfInvalid(nb, major) {
  // TODO
  return nb;
}

function _repeatString(s, n) {
  var pattern = s;
  s = '';
  while (n > 0) {
    if (n % 2 === 1) {
      s += pattern;
    }
    pattern += pattern;
    n = n >> 1;
  }
  return s;
}

const _upgraders = {
  4: function to4(nb) {
    const _mime_map = {
      "text" : "text/plain",
      "html" : "text/html",
      "svg" : "image/svg+xml",
      "png" : "image/png",
      "jpeg" : "image/jpeg",
      "latex" : "text/latex",
      "json" : "application/json",
      "javascript" : "application/javascript",
    };

    return _warnIfInvalid(_warnIfInvalid(nb, 3)
      .setIn(['metadata', 'orig_nbformat'], nb.getIn(['metadata', 'orig_nbformat'], 3))
      .set('nbformat', 4)
      .set('nbformat_minor', 0)
      .set('cells', nb
        .get('worksheets')
        .flatten()
        .map(cell => {
          const newCell = cell.set('metadata', Map());
          const cellType = newCell.get('cell_type');
          switch (cellType) {
            case 'code':
              return newCell
                .setIn(['metadata', 'collapsed'], newCell.get('collapsed'))
                .delete('collapsed')
                .delete('language')
                .set('source', newCell.get('input', ''))
                .delete('input')
                .set('execution_count', newCell.get('prompt_number'))
                .delete('prompt_number')
                .update('outputs', output => {
                  switch (output.get('output_type')) {
                  case 'pyerr':
                    return output.set('output_type', 'error');
                  case 'stream':
                    return output
                      .set('name', output.get('stream', 'stdout'))
                      .delete('stream');
                  case 'pyout':
                    output = output
                      .set('output_type', 'execute_result')
                      .set('execution_count', output.get('prompt_number'))
                      .delete('prompt_number')
                    // Purposefully continue onto the display_data
                    // transformation by not returning or breaking the switch
                  case 'display_data':
                    const data = {};
                    output = output
                      .update('metadata', Map(), metadata => {
                        const newMetadata = {};
                        metadata
                          .map((value, key) => {
                            newMetadata[_mime_map[key] || key] = value;
                          });
                        return fromJS(newMetadata);
                      })
                      .map((value, key) => {
                        if (['output_type', 'execution_count', 'metadata'].indexOf(key) === -1) {
                          data[_mime_map[key] || key] = value;
                          return null;
                        }
                        return value;
                      })
                      .filter(value => Boolean(value));
                      .set('data', new Map(data));
                    const jsonData = output.getIn(['data', 'application/json']);
                    if (jsonData) {
                      output = output.setIn(['data', 'application/json'], JSON.parse(output.getIn(['data', 'application/json'])));
                    }
                    // promote ascii bytes (from v2) to unicode
                    ['image/png', 'image/jpeg'].forEach(imageMimetype => {
                      const imageData = output.getIn(['data', imageMimetype]);
                      if (imageData instanceof Buffer) {
                        output = output.setIn(['data', imageMimetype], imageData.toString('ascii'));
                      }
                    });
                    return output;
                  }
                });
            case 'heading':
              return newCell
                .set('cell_type', 'markdown')
                .set('source', _repeatString('#', newCell.get('level', 1)) + ' ' + newCell
                  .get('source', '')
                  .split('\n')
                  .join(' ')
                );
            case 'html':
              return newCell.set('cell_type', 'markdown');
            default:
              return newCell;
          }
        })
      )
      .delete('worksheets')
      .deleteIn(['metadata', 'name'])
      .deleteIn(['metadata', 'signature']), 4);
  },
};

export function upgrade(nb, fromMajor, toMajor) {
  if (toMajor < fromMajor) {
    throw new Error('cannot downgrade');
  }

  while (fromMajor < toMajor) {
    let upgrader = _upgraders[fromMajor++];
    if (upgrader) {
      nb = upgrader(nb);
    } else {
      throw new Error(`upgrade path from ${fromMajor-1} to ${fromMajor} unknown`);
    }
  }
  return nb;
}
