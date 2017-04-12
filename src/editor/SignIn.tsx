import * as React from 'react';
import Panel from './Panel';
import { ApiCall, SetError, SetUser, style} from './TranslationEditor';

export interface SignInProps {
  error?: string;
  apiCall: ApiCall;
  setUser: SetUser;
  setError: SetError;
}

export interface SignInState {
  email: string;
  password: string;
  [x: string]: string;
}

class SignIn extends React.PureComponent<SignInProps, SignInState> {

  state = {
    email: '',
    password: '',
  };

  onFieldChange = ({ target: { name, value } }: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ [name]: value });
  }

  onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { apiCall, setError, setUser } = this.props;

    apiCall('post', '/api_frontend/v1/login', { user: this.state }).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setUser(data.user);
      }
    });
  }

  render() {
    const { email, password } = this.state;
    const { error } = this.props;

    return (
      <Panel error={error}>
        <form onSubmit={this.onSubmit}>
          <label htmlFor="email" style={style.label}>
            Email
          </label>
          <input type="email" name="email" value={email} onChange={this.onFieldChange} style={style.input} />
          <label htmlFor="password" style={style.label}>
            Password
          </label>
          <input type="password" name="password" value={password} onChange={this.onFieldChange} style={style.input} />
          <div>
            <button style={style.button}>Sign In</button>
          </div>
        </form>
      </Panel>
    );
  }
}

export default SignIn;
