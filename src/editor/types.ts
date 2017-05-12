import { Map } from 'immutable';
import { StoredTranslation, StoredTranslations }from '../Connector';
import { Dispatch, Messages } from '../types';
import { UpdateTranslation } from './TranslationEditor';

export type SortedKeys = Map<string, StoredTranslation>;
export type PendingChanges = Map<string, string>;

export interface EditorProps {
  dispatch: Dispatch;
  locale: string;
  messages: Messages;
  pathname: string;
  search: string;
  translationStore: StoredTranslations;
  updateTranslation: UpdateTranslation;
};

export interface EditorState {
  pendingChanges: PendingChanges;
  sortedKeys: SortedKeys;
};
