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

describe('parse outputs', () => {
  it('should read pyerror outputs correctly', () => {
    const test = fromJS({
      "metadata": {
        "name": "test_error",
      },
      "nbformat": 3,
      "nbformat_minor": 0,
      "worksheets": [
        {
          "cells": [
            {
              "cell_type": "code",
              "metadata": {},
              "source": ["print('bound to error"],
              "execution_count": 1,
              "outputs": [{
                "output_type": "pyerr",
                "ename": "SyntaxError",
                "evalue": "EOL while scanning string literal",
              }]
            },
          ],
        }
      ]
    });
    const upgraded = upgrade(test, 3, 4);
    expect(upgraded.getIn(['cells', 0, 'outputs', 0, 'output_type'])).to.equal("error");
  });
});
