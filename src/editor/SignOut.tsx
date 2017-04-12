import * as Radium from 'radium';
import * as React from 'react';
import { ApiCall, SetUser, style} from './TranslationEditor';

export interface SignOutProps {
  apiCall: ApiCall;
  setUser: SetUser;
}

export class SignOut extends React.PureComponent<SignOutProps, void> {
  logout = () => {
    const { apiCall, setUser } = this.props;
    apiCall('delete', '/api_frontend/v1/logout').then(() => {
      setUser();
    });
  }

  render() {
    return (
      <button onClick={this.logout} style={style.button}>Logout</button>
    );
  }
}

export default Radium(SignOut);
