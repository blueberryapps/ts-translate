import * as Radium from 'radium';
import * as React from 'react';

export interface UserProps {
  username?: string;
  photo?: string;
  email?: string;
}

export const User: React.StatelessComponent<UserProps> = ({ username, photo }) => (
  <div style={style.wrapper}>
    <img src={photo} alt={username} style={style.image} />
    {username}
  </div>
);

const style = {
  wrapper: {
    display: 'inline-block',
    paddingRight: '5px',
  },
  image: {
    marginRight: '5px',
    position: 'relative',
    top: '3px',
  },
};

export default Radium(User);
