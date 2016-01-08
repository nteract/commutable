import Immutable from 'immutable';

import { cleanMultilines } from './cleaning';

export function fromJS(notebookJSON) {
  const immnb = Immutable.fromJS(notebookJSON);
  return cleanMultilines(immnb);
}
