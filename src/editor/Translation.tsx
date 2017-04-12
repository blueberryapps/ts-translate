import * as Radium from 'radium';
import { Style } from 'radium';
import * as React from 'react';
import { classifyKey } from '../classifyKey';
import { PendingChanges } from './Editor';
import { style, UpdateTranslation } from './TranslationEditor';

export interface EditorProps {
  value: string | number;
  onChange: (x: any) => void;
}

const StringEditor: React.StatelessComponent<EditorProps> = ({ value, onChange }) => (
  <textarea
    style={[style.input, { minHeight: '70px', marginBottom: '5px' }]}
    value={value || ''}
    onChange={onChange}
  />
);

const NumberEditor: React.StatelessComponent<EditorProps> = ({ value, onChange }) => (
  <input
    type="number"
    style={style.input}
    value={value || ''}
    onChange={onChange}
  />
);

const BoolEditor: React.StatelessComponent<EditorProps> = ({ value: inputValue, onChange }) => (
  <input
    type="checkbox"
    style={style.input}
    value={inputValue || 'false'}
    onChange={({ target: { checked: value } }) => onChange({ target: { value } })}
  />
);

const mapping = {
  string: Radium(StringEditor),
  number: Radium(NumberEditor),
  bool: Radium(BoolEditor),
};

export interface TranslationProps {
  opened: boolean;
  onChange: (keyPath: string, text: string) => (x: { target: { value?: string | number, keyPath: string }}) => void;
  dataType?: string | number;
  keyPath: string;
  pendingChanges: PendingChanges;
  text: string;
  updateTranslation: UpdateTranslation;
};

export interface TranslationState {
  opened: boolean;
}

export class Translation extends React.PureComponent<TranslationProps, TranslationState> {

  state = {
    opened: false,
  };

  save = () => {
    const { keyPath, text, updateTranslation } = this.props;

    updateTranslation(this.key().join('.'), text, keyPath);
  }

  restore = () => {
    const { keyPath, text, pendingChanges, onChange } = this.props;

    if (pendingChanges.has(keyPath)) {
      onChange(keyPath, text)({ target: { value: pendingChanges.get(keyPath), keyPath } });
    }
  }

  key() {
    const { keyPath } = this.props;
    return keyPath.split('.').splice(1);
  }

  render() {
    const { opened } = this.state;
    const { dataType, keyPath, text, onChange, pendingChanges } = this.props;
    const EditorComponent = mapping[dataType || 'string'];
    const changed = pendingChanges.has(keyPath);

    return (
      <div key="hovering" style={[styles.wrapper, changed && styles.changed]}>
        <strong key={this.key().join('.')} style={styles.key} onClick={() => (this.setState({ opened: !opened }))} >{keyPath}</strong>
        {(opened || this.props.opened) && <EditorComponent value={text} onChange={onChange(keyPath, text)} />}
        { Radium.getState(this.state, 'hovering', ':hover') &&
          <Style rules={{ [`.${classifyKey(this.key().join('.'))}`]: { background: 'red' } }} />}
        {changed && <button onClick={this.save} style={style.button} key={`${this.key()}Save`}>Save</button>}
        {changed && <button onClick={this.restore} style={[style.button, styles.buttonSecondary]} key={`${this.key()}Restore`}>Restore</button>}
      </div>
    );
  }
}

const styles = {
  wrapper: {
    ':hover': {},
  },
  changed: {
    background: 'yellow',
  },
  buttonSecondary: {
    marginLeft: '10px',
    border: `1px solid #555`,
    backgroundColor: '#555',
    ':hover': {
      border: '1px solid #111111',
    },
  },
  key: {
    display: 'block',
    marginBottom: '3px',
    ':hover': {
      cursor: 'pointer',
    },
  },
};

export default Radium(Translation);
