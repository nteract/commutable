import { expect } from 'chai';

import { readNotebook } from '../src';

describe('readNotebook', () => {
  it('reads a notebook from disk', () => {
    expect(readNotebook()).to.not.be.null;
  });
});
