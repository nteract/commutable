import { expect } from 'chai';

import { readImmutableNotebook } from '../src';

import path from 'path';

describe('readImmutableNotebook', () => {
  it('reads a notebook from disk, converting multi-line strings', () => {
    return readImmutableNotebook(path.join(__dirname, './multiples.ipynb'))
      .then((nb) => {
        expect(nb).to.not.be.null;

        const cells = nb.get('cells');
        cells.forEach(cell => {
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
