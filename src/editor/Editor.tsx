import { Map } from 'immutable';
import *  as Radium from 'radium';
import * as React from 'react';
import { updateMessages } from '../actions';
import { StoredTranslation, StoredTranslations }from '../Connector';
import { Dispatch, Messages } from '../types';
import Translation from './Translation';
import { UpdateTranslation } from './TranslationEditor';

function convertDotPath(path: string, value: string) {
  const [last, ...paths] = path.split('.').reverse();
  return paths.reduce((acc, el) => ({ [el]: acc }), { [last]: value } as any);
}
export type SortedKeys = Map<string, StoredTranslation>;
export type PendingChanges = Map<string, string>;

export interface EditorProps {
  dispatch: Dispatch;
  messages: Messages;
  pathname: string;
  search: string;
  translationStore: StoredTranslations;
  updateTranslation: UpdateTranslation;
}
export interface EditorState {
  pendingChanges: PendingChanges;
  sortedKeys: SortedKeys;
};

export class Editor extends React.PureComponent<EditorProps, EditorState> {

  state = {
    pendingChanges: Map<string, string>(),
    sortedKeys: this.sortAndFilterKeys(this.props.search),
  };

  componentWillReceiveProps(next: EditorProps) {
    const { translationStore, pathname, search } = this.props;

    const anyNewTranslation = translationStore.get(pathname).keySeq().hashCode() !== next.translationStore.get(pathname).keySeq().hashCode();

    if (pathname !== next.pathname || search !== next.search || anyNewTranslation) {
      this.setState({ sortedKeys: this.sortAndFilterKeys(next.search) });
    }
  }

  onChange = (keyPath: string, originalText: string) => ({ target: { value } }: any) => {
    const { dispatch } = this.props;
    const { pendingChanges } = this.state;

    if (!pendingChanges.has(keyPath)) { // new update
      this.setState({ pendingChanges: pendingChanges.set(keyPath, originalText) });
    } else if (pendingChanges.get(keyPath) === value) { // reset
      this.setState({ pendingChanges: pendingChanges.remove(keyPath) });
    }

    dispatch(updateMessages(convertDotPath(keyPath, value)));
  }

  sortAndFilterKeys(search: string): SortedKeys {
    const { translationStore, pathname } = this.props;

    const searchPattern = search.length > 0
      ? new RegExp(search.split(' ').join('.*'), 'i')
      : null;

    const keys = (translationStore.get(pathname) || Map());

    const filteredKeys = searchPattern
      ? keys.filter((d: StoredTranslation) => searchPattern.test([d.get('key'), d.get('text')].join()))
      : keys;

    return filteredKeys.sortBy((k: StoredTranslation) => k.get('key')) as SortedKeys;
  }

  updateTranslation = (key: string, text: string, keyPath: string) => {
    const { updateTranslation } = this.props;
    const { pendingChanges } = this.state;

    if (pendingChanges.has(keyPath)) {
      this.setState({ pendingChanges: pendingChanges.remove(keyPath) });
    }

    updateTranslation(key, text);
  }

  renderTranslation = (data: StoredTranslation) => {
    const { search, messages } = this.props;
    const { pendingChanges } = this.state;

    if (!data) {
      return null;
    }

    const text = messages.getIn(`${data.get('key')}`.split('.'));

    if (Map.isMap(text)) {
      return <div key={`${data.get('key')}`} />;
    }

    return (
      <Translation
        key={`${data.get('key')}`}
        dataType={`${data.get('data_type')}`}
        keyPath={`${data.get('key')}`}
        text={text || data.get('text')}
        opened={search.length > 0}
        onChange={this.onChange}
        pendingChanges={pendingChanges}
        updateTranslation={this.updateTranslation}
      />
    );
  }

  render() {
    const { sortedKeys } = this.state;

    return (
      <div>
        <div style={{ width: 'auto', height: 'auto' }}>
          {sortedKeys.map(this.renderTranslation)}
        </div>
      </div>
    );
  }

}

export default Radium(Editor);
