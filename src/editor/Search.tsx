import * as Radium from 'radium';
import * as React from 'react';
import { style } from './TranslationEditor';

export interface SearchProps {
  onChange: (x: string) => void;
  search: string;
};

const Search: React.StatelessComponent<SearchProps> = ({ onChange, search }) => (
  <div style={[{position: 'relative'}, search.length > 0 && { marginRight: '34px'}]}>
    <input
      type="text"
      onChange={({target: { value }}) => onChange(value)}
      style={style.input}
      placeholder="Search..."
      value={search}
    />
    {search.length > 0 &&
      <button style={[style.button, reset]} onClick={() => onChange('')}>X</button>
    }
  </div>
);

const reset = {
  position: 'absolute',
  left: '100%',
  top: 0,
  height: '34px',
  width: '34px',
  textAlign: 'center',
  padding: '8px 8px',
};

export default Radium(Search);
