import { expect } from 'chai';

import { readImmutableNotebook } from '../src';

import path from 'path';

describe('readImmutableNotebook', () => {
  it('reads a notebook from disk', () => {
    return readImmutableNotebook(path.join(__dirname, './multiples.ipynb'))
      .then((nb) => {
        expect(nb).to.not.be.null;
      });
  });
});
