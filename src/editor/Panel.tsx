import * as Radium from 'radium';
import * as React from 'react';

export interface PanelProps {
  error?: string;
};

const Panel: React.StatelessComponent<PanelProps> = ({ error, children }) => (
  <div>
    <h1 style={style.heading}>Translator</h1>
    {!!error && <span style={style.error}>{error}</span>}
    {children}
  </div>
);

const style = {
  heading: {
    margin: '0 0 15px',
    fontWeight: 600,
  } as React.CSSProperties,
  error: {
    color: 'red',
    fontSize: '12px',
  },
};

export default Radium(Panel);
