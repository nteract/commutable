import { expect } from 'chai';

import { fromJS } from '../src';
import { readJSON } from './notebook_helpers';
import { valid } from 'notebook-test-data';

import path from 'path';

describe('readImmutableNotebook', () => {
  it('reads a notebook from disk, converting multi-line strings', () => {
    return readJSON(valid[0])
      .then((notebook) => {
        const nb = fromJS(notebook);

        expect(nb).to.not.be.null;

        const cellOrder = nb.get('cellOrder');
        cellOrder.forEach(id => {
          const cell = nb.getIn(['cellMap', id]);
          // Converted
          expect(cell.get('source')).to.be.a('string');

          if (cell.contains('outputs')) {
            cell.outputs.filter(o => o.output_type === 'stream')
                        .forEach(o => {
                          expect(o.text).to.be.a('string');
                        });
            cell.outputs.filter(o => o.data)
                        .map(o => o.data)
                        .forEach(mimebundle => {
                          expect(mimebundle).to.be.a('string');
                        });
          }

        });
      });
  });
});
