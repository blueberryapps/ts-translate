import * as Radium from 'radium';
import * as React from 'react';

export interface OpenerProps {
  open: () => void;
  opened: boolean;
  width: number;
};

const Opener: React.StatelessComponent<OpenerProps> = ({ open, opened, width }) => (
  <button onClick={open} style={[style, opened && { right: width }]}>
    TS
  </button>
);

const style = {
  backgroundColor: '#111111',
  color: 'white',
  fontSize: '14px',
  fontWeight: 600,
  padding: '10px',
  border: 0,
  zIndex: 12,
  position: 'fixed',
  top: 0,
  right: 0,
  textTransform: 'uppercase',
  transition: 'all .2s',
  ':hover': {
    backgroundColor: 'black',
    cursor: 'pointer',
  },
};

export default Radium(Opener);
