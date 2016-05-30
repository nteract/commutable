import {
  fromJS as _fromJS,
  List,
} from 'immutable';

import { cleanMultilineNotebook, makeMultilineNotebook } from './cleaning';
import { v4 as uuid } from 'uuid';
import { upgrade } from './convert';
export { upgrade };

export function fromJS(notebookJS) {
  // TODO: Check the version of the notebook and convert it to the expected
  // version for in memory operations.
  const immnb = cleanMultilineNotebook(_fromJS(notebookJS));

  const cellData = {};
  return immnb
    .set('cellOrder', immnb.get('cells').map(cell => {
      const id = uuid();
      cellData[id] = cell;
      return id;
    }))
    .remove('cells')
    .set('cellMap', _fromJS(cellData));
}

export function toJS(notebook) {
  return makeMultilineNotebook(notebook
    .set('cells', notebook
      .get('cellOrder', List<string>())
      .map(id =>
        notebook.getIn(['cellMap', id], _fromJS({}))
      )
    )
    .remove('cellOrder')
    .remove('cellMap'))
    .toJS();
}


export const emptyNotebook = fromJS({
  cells: [],
  nbformat: 4,
  nbformat_minor: 0,
});

export const emptyMarkdownCell = _fromJS({
  cell_type: 'markdown',
  metadata: {},
  source: '',
});

export const emptyCodeCell = _fromJS({
  cell_type: 'code',
  execution_count: null,
  metadata: {
    collapsed: false,
  },
  source: '',
  outputs: [],
});

export function insertCellAt(notebook, cell, cellID, index) {
  return notebook.setIn(['cellMap', cellID], cell)
                 .set('cellOrder',
                  notebook.get('cellOrder').insert(index, cellID));
}

export function insertCellAfter(notebook, cell, cellID, priorCellID) {
  return insertCellAt(notebook, cell, cellID, notebook.get('cellOrder').indexOf(priorCellID) + 1);
}

export function appendCell(notebook, cell, cellID = uuid()) {
  return notebook.setIn(['cellMap', cellID], cell)
                 .set('cellOrder',
                  notebook.get('cellOrder').push(cellID));
}

export function updateSource(notebook, cellID, source) {
  return notebook.setIn(['cellMap', cellID, 'source'], source);
}

export function clearCellOutput(notebook, cellID) {
  return notebook.setIn(['cellMap', cellID, 'outputs'], List<any>());
}

export function updateOutputs(notebook, cellID, outputs) {
  return notebook.setIn(['cellMap', cellID, 'outputs'], outputs);
}

export function updateExecutionCount(notebook, cellID, count) {
  return notebook.setIn(['cellMap', cellID, 'execution_count'], count);
}

export function removeCell(notebook, cellId) {
  return notebook
    .removeIn(['cellMap', cellId])
    .update('cellOrder', cellOrder => cellOrder.filterNot(id => id === cellId));
}

export function removeCellAt(notebook, index) {
  return removeCell(notebook, notebook.getIn(['cellOrder', index]));
}
