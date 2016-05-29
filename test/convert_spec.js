import { expect } from 'chai';
import { upgrade } from '../src';
import { fromJS } from 'immutable';
import { cleanMultilineNotebook } from '../src/cleaning';
import { valid } from 'notebook-test-data';
import * as fs from 'fs';

const nb2 = fromJS(JSON.parse(fs.readFileSync(valid.v2.v2notebook)));
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
  it('should error for downgrades', () => {
    expect(() => upgrade(nb4, 4, 3)).to.throw(Error);
  });
  it('should error for unkown versions', () => {
    expect(() => upgrade(nb4, 9, 10)).to.throw(Error);
  });
  it('2to4', () => {
    const upgraded = upgrade(nb2, 2, 4);
    expect(upgraded.getIn(['metadata', 'orig_nbformat'])).to.equal(2);
    expect(upgraded.get('worksheets')).to.be.undefined;
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
  it('parse outputs with metadata', () => {
    const test = fromJS({
      "metadata": {
        "name": "test_metadata_output",
      },
      "nbformat": 3,
      "nbformat_minor": 0,
      "worksheets": [
        {
          "cells": [
            {
              "cell_type": "code",
              "metadata": {},
              "source": ["print('with metadata')"],
              "execution_count": 1,
              "outputs": [{
                "output_type": "display_data",
                "stream": "stdout",
                "metadata": {
                  "test_key": "test_value",
                },
                "text": [
                  "with metadata\n",
                ],
              }]
            },
          ],
        }
      ]
    });
    const upgraded = upgrade(test, 3, 4);
    expect(upgraded.getIn(['cells', 0, 'outputs', 0, 'metadata']).size).to.equal(1);
  });
  it('parse outputs with JSON', () => {
    const test = fromJS({
      "metadata": {
        "name": "test_json_outputs",
      },
      "nbformat": 3,
      "nbformat_minor": 0,
      "worksheets": [
        {
          "cells": [
            {
              "cell_type": "code",
              "metadata": {},
              "source": ["print('with metadata')"],
              "execution_count": 1,
              "outputs": [{
                "output_type": "display_data",
                "metadata": {},
                "json": ['{"value": "i love me som json"}'],
              }],
            },
          ],
        }
      ]
    });
    const upgraded = upgrade(test, 3, 4);
    expect(upgraded.getIn(['cells', 0, 'outputs', 0, 'data']).size).to.equal(1);
  });
  it('should leave unkown outputs as is', () => {
    const test = fromJS({
      "metadata": {
        "name": "test_unkown_output",
      },
      "nbformat": 3,
      "nbformat_minor": 0,
      "worksheets": [
        {
          "cells": [
            {
              "cell_type": "code",
              "metadata": {},
              "source": ["print('unkown output')"],
              "outputs": [{
                "output_type": "unknown" ,
              }]
            },
          ],
        }
      ]
    });
    const upgraded = upgrade(test, 3, 4);
    expect(upgraded.getIn(['cells', 0, 'outputs', 0, 'output_type'])).to.equal('unknown');
  });
});

describe('parse cellTypes', () => {
  it('should parse HTML cells correctly', () => {
    const test = fromJS({
      "metadata": {
        "name": "test_html_cells",
      },
      "nbformat": 3,
      "nbformat_minor": 0,
      "worksheets": [
        {
          "cells": [
            {
              "cell_type": "html",
              "metadata": {},
              "source": ["<h1>HTML Cell</h1>"],
              "outputs": [{}]
            },
          ],
        }
      ]
    });
    const upgraded = upgrade(test, 3, 4);
    expect(upgraded.getIn(['cells', 0, 'cell_type'])).to.equal("markdown");
  });
});
