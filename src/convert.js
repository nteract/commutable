import { Map, List, fromJS } from 'immutable';
import imageType from 'image-type';
import repeat from 'lodash.repeat';

/**
 * Throws if the notebook is invalid for a given major revision
 * @param  {Map} nb       immutable map notebook object
 * @param  {number} major nbformat major revision
 * @return {Map} nb
 */
function throwIfInvalid(nb) {
  // TODO: Implement check
  return nb;
}

/**
 * Dictionary of functions that perform upgrades.  The keys are the major
 * revision that the functions upgrade too.
 */
const upgraders = {
  4: function to4(nb) {
    const mime_map = {
      text: 'text/plain',
      html: 'text/html',
      svg: 'image/svg+xml',
      png: 'image/png',
      jpeg: 'image/jpeg',
      latex: 'text/latex',
      json: 'application/json',
      javascript: 'application/javascript',
    };

    return throwIfInvalid(throwIfInvalid(nb, 3)
      .setIn(['metadata', 'orig_nbformat'], nb.getIn(['metadata', 'orig_nbformat'], 3))
      .set('nbformat', 4)
      .set('nbformat_minor', 0)
      .set('cells', nb
        .get('worksheets')
        .reduce((a, b) => a.concat(b.get('cells')), new List())
        .map(cell => {
          const newCell = cell.set('metadata', new Map());
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
                .update('outputs', outputs =>
                  outputs.map(initialOutput => {
                    const data = {};
                    let output = initialOutput;
                    switch (output.get('output_type')) {
                      case 'pyerr':
                        return output.set('output_type', 'error');
                      case 'stream':
                        return output
                          .set('name', output.get('stream', 'stdout'))
                          .delete('stream');
                      case 'pyout':
                      case 'display_data':
                        if (output.get('output_type') === 'pyout') {
                          output = output
                            .set('output_type', 'execute_result')
                            .set('execution_count', output.get('prompt_number'))
                            .delete('prompt_number');
                        }
                        output = output
                          .update('metadata', new Map(), metadata => {
                            const newMetadata = {};
                            metadata
                              .forEach((value, key) => {
                                newMetadata[mime_map[key] || key] = value;
                              });
                            return fromJS(newMetadata);
                          })
                          .map((value, key) => {
                            if (['output_type', 'execution_count', 'metadata']
                                .indexOf(key) === -1) {
                              data[mime_map[key] || key] = value;
                              return null;
                            }
                            return value;
                          })
                          .filter(value => Boolean(value))
                          .set('data', new Map(data));
                        if (output.hasIn(['data', 'application/json'])) {
                          output = output.setIn(['data', 'application/json'],
                                    JSON.parse(output.getIn(['data', 'application/json'])));
                        }
                        // promote ascii bytes (from v2) to unicode
                        ['image/png', 'image/jpeg'].forEach(imageMimetype => {
                          let imageData = output.getIn(['data', imageMimetype]);
                          let imageBuffer;

                          try {
                            imageBuffer = Buffer.from(imageData, 'ascii');
                          } catch (error) {
                            imageBuffer = null;
                          }

                          if (imageBuffer && imageType(imageBuffer)) {
                            imageData = imageData.toString('ascii');
                            output = output.setIn(['data', imageMimetype], imageData);
                          }

                          if (imageData) {
                            imageData = imageData
                              .trim()
                              .split('\n')
                              .map(x => `${x}\n`);
                            output = output.setIn(['data', imageMimetype], imageData);
                          }
                        });
                        return output;
                      default:
                        return initialOutput;
                    }
                  })
                );
            case 'heading':
              return newCell
                .set('cell_type', 'markdown')
                .set('source',
                  [
                    repeat('#', newCell.get('level', 1)),
                    newCell.get('source', '').join(' '),
                  ].join(' ')
                  .split('\n')
                )
                .delete('level');
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
  3: function to3(nb) {
    const mime_type = {
      text: 'text/plain',
      html: 'text/html',
      svg: 'image/svg+xml',
      png: 'image/png',
      jpeg: 'image/jpeg',
      latex: 'text/latex',
      json: 'application/json',
      javascript: 'application/javascript',
    };

    return throwIfInvalid(throwIfInvalid(nb, 2)
        .setIn(['metadata', 'orig_nbformat'], nb.getIn(['metadata', 'orig_nbformat'], 2))
        .set('nbformat', 3)
        .set('nbformat_minor', 0)
        .setIn(['worksheets', 'cels'], nb
          .getIn(['worksheets', 0, 'cells'])
          .map(cell => {
            const newCell = cell.set('metadata', new Map());
            return newCell;
          })
        )
      )
    }
};


export function upgrade(nb, fromMajor, toMajor) {
  if (toMajor < fromMajor) {
    throw new Error('cannot downgrade');
  }

  let currentMajor = fromMajor;
  let tmpnb = nb;

  while (currentMajor < toMajor) {
    const upgrader = upgraders[++currentMajor];
    if (upgrader) {
      tmpnb = upgrader(tmpnb);
    } else {
      throw new Error(`upgrade path from ${currentMajor - 1} to ${fromMajor} unknown`);
    }
  }
  return tmpnb;
}
