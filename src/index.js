import Immutable from 'immutable';

import { cleanMultilines } from './cleaning';
import { v4 as uuid } from 'node-uuid';

export function fromJS(notebookJSON) {
  const immnb = cleanMultilines(Immutable.fromJS(notebookJSON));

  const cellData = {};
  return immnb
    .set('cellOrder', immnb.get('cells').map(cell => {
      const id = uuid();
      cellData[id] = cell;
      return id;
    }))
    .remove('cells')
    .set('cellMap', Immutable.fromJS(cellData));
}
