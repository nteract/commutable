import { expect } from 'chai';
import { upgrade } from '../src';
import { fromJS } from 'immutable';
import { cleanMultilineNotebook } from '../src/cleaning';
import { valid } from 'notebook-test-data';
import * as fs from 'fs';

const nb3 = fromJS(JSON.parse(fs.readFileSync(valid.v3.v3notebook)));
const nb4 = fromJS(JSON.parse(fs.readFileSync(valid.v4.v4notebook)));

describe('upgrade', () => {
  it('3to4', () => {
    expect(
      upgrade(nb3, 3, 4).toJS()
    ).to.deep.equal(
      nb4.setIn(['metadata', 'orig_nbformat'], 3).toJS()
    );
  });
});
