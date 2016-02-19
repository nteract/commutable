import { expect } from 'chai';

import {
  fromJS,
  toJS,
  Notebook,
  emptyCodeCell,
  emptyMarkdownCell,
  insertCellAt,
  appendCell,
  removeCell,
  removeCellAt,
} from '../src';

import { readJSON } from './notebook_helpers';
import { valid } from 'notebook-test-data';

const LANGUAGE_INFO = {
  'file_extension': '.js',
  'mimetype': 'application/javascript',
  'name': 'javascript',
  'version': '5.5.0',
};

describe('fromJS', () => {
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

describe('toJS', () => {
  it('returns something', () => {
    return readJSON(valid[0])
      .then((notebook) => {
        const nb = toJS(fromJS(notebook));
        expect(nb).to.not.be.null;
      });
  });
  it('removes cellMap', () => {
    return readJSON(valid[0])
      .then((notebook) => {
        const nb = toJS(fromJS(notebook));
        expect(nb.cellMap).to.be.undefined;
      });
  });
  it('removes cellOrder', () => {
    return readJSON(valid[0])
      .then((notebook) => {
        const nb = toJS(fromJS(notebook));
        expect(nb.cellOrder).to.be.undefined;
      });
  });
  it('creates cells', () => {
    return readJSON(valid[0])
      .then((notebook) => {
        const inMem = fromJS(notebook);
        const nb = toJS(inMem);
        expect(nb.cells).to.not.be.undefined;
        expect(nb.cells.length).to.equal(inMem.get('cellOrder').count());
      });
  });
});

describe('Notebook', () => {
  it('creates an empty notebook', () => {

    const nb = new Notebook(LANGUAGE_INFO);
    expect(nb.get('cellOrder').size).to.equal(0);
    expect(nb.get('cellMap').size).to.equal(0);
    expect(nb.getIn(['language_info', 'file_extension'])).to.equal('.js');
  });
});

describe('emptyMarkdownCell', () => {
  it('is an empty immutable markdown cell', () => {
    expect(emptyMarkdownCell.get('cell_type')).to.equal('markdown');
    expect(emptyMarkdownCell.get('source')).to.equal('');
  });
});

describe('emptyCodeCell', () => {
  it('is an empty immutable code cell', () => {
    expect(emptyCodeCell.get('cell_type')).to.equal('code');
    expect(emptyCodeCell.get('source')).to.equal('');
    expect(emptyCodeCell.get('outputs').size).to.equal(0);
  });
});

describe('insertCellAt', () => {
  it('inserts cell into a notebook', () => {
    const nb = new Notebook(LANGUAGE_INFO);
    expect(nb.get('cellOrder').size).to.equal(0);
    expect(nb.get('cellMap').size).to.equal(0);

    const nb2 = insertCellAt(nb, emptyCodeCell, 0);
    expect(nb2.get('cellOrder').size).to.equal(1);
    expect(nb2.get('cellMap').size).to.equal(1);
  });

  it('allows arbitrary insertion', () => {
    const nb = new Notebook(LANGUAGE_INFO);
    expect(nb.get('cellOrder').size).to.equal(0);
    expect(nb.get('cellMap').size).to.equal(0);

    const nb2 = insertCellAt(nb, emptyCodeCell, 0);
    expect(nb2.get('cellOrder').size).to.equal(1);
    expect(nb2.get('cellMap').size).to.equal(1);

    const cell = emptyCodeCell.set('source', 'console.log()');

    const nb3 = insertCellAt(nb2, cell, 1);
    expect(nb3.get('cellOrder').size).to.equal(2);
    expect(nb3.get('cellMap').size).to.equal(2);

    const cellID = nb3.getIn(['cellOrder', 1]);
    expect(nb3.getIn(['cellMap', cellID, 'source'])).to.equal('console.log()');

    expect(nb3.getIn(['cellMap',
                      nb3.getIn(['cellOrder', 0]),
                      'source'])).to.equal('');

    // Ridiculous number results in being stuck on the end
    const nb4 = insertCellAt(nb3, emptyCodeCell.set('source', 'woo'), 200);
    expect(nb4.getIn(['cellMap',
                      nb4.getIn(['cellOrder', 2]),
                      'source'])).to.equal('woo');
    const nb5 = insertCellAt(nb4, emptyCodeCell.set('source', 'yeah'), 100);
    expect(nb5.getIn(['cellMap',
                      nb5.getIn(['cellOrder', 3]),
                      'source'])).to.equal('yeah');
  });
});

describe('appendCell', () => {
  it('appends a cell to the end of a notebook', () => {
    const nb = appendCell(new Notebook(LANGUAGE_INFO), emptyCodeCell);
    const nb2 = appendCell(nb, emptyCodeCell.set('source', 'Yay'));
    expect(nb2.get('cellOrder').size).to.equal(2);
    expect(nb2.get('cellMap').size).to.equal(2);
    expect(nb2.getIn(['cellMap',
                      nb2.getIn(['cellOrder', 1]),
                      'source'])).to.equal('Yay');

  });
});

describe('removeCellAt', () => {
  it('removes correct cell', () => {
      let nb = new Notebook(LANGUAGE_INFO);
      nb = appendCell(nb, emptyCodeCell);
      nb = appendCell(nb, emptyCodeCell);
      nb = appendCell(nb, emptyCodeCell);
      const cellOrder = nb.get('cellOrder');

      nb = removeCellAt(nb, 1);

      expect(nb.get('cellOrder').count()).to.equal(2);
      expect(nb.get('cellMap').count()).to.equal(2);
      expect(nb.getIn(['cellMap', cellOrder.get(1)])).to.be.undefined;
      expect(nb.getIn(['cellMap', cellOrder.get(0)])).to.not.be.undefined;
      expect(nb.getIn(['cellMap', cellOrder.get(2)])).to.not.be.undefined;
  });
  it('doesn\'t fail if index is invalid', () => {
      let nb = new Notebook(LANGUAGE_INFO);
      nb = appendCell(nb, emptyCodeCell);
      nb = appendCell(nb, emptyCodeCell);
      nb = appendCell(nb, emptyCodeCell);
      nb = removeCellAt(nb, -1);
      nb = removeCellAt(nb, 4);
  });
});

describe('removeCell', () => {
  it('removes correct cell', () => {
      let nb = new Notebook(LANGUAGE_INFO);
      nb = appendCell(nb, emptyCodeCell);
      nb = appendCell(nb, emptyCodeCell);
      nb = appendCell(nb, emptyCodeCell);
      const cellOrder = nb.get('cellOrder');

      nb = removeCell(nb, cellOrder.get(1));

      expect(nb.get('cellOrder').count()).to.equal(2);
      expect(nb.get('cellMap').count()).to.equal(2);
      expect(nb.getIn(['cellMap', cellOrder.get(1)])).to.be.undefined;
      expect(nb.getIn(['cellMap', cellOrder.get(0)])).to.not.be.undefined;
      expect(nb.getIn(['cellMap', cellOrder.get(2)])).to.not.be.undefined;
  });
  it('doesn\'t fail if id is invalid', () => {
      let nb = new Notebook(LANGUAGE_INFO);
      nb = appendCell(nb, emptyCodeCell);
      nb = appendCell(nb, emptyCodeCell);
      nb = appendCell(nb, emptyCodeCell);
      nb = removeCell(nb, 'notrealid');
  });
});
