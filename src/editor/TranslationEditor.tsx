import { Map } from 'immutable';
import * as fetch from 'isomorphic-fetch';
import * as Radium from 'radium';
import { Style } from 'radium';
import * as React from 'react';
import { PropTypes as RPT } from 'react';
import { updateMessages } from '../actions';
import { StoredTranslation, StoredTranslations }from '../Connector';
import { Translator } from '../translator';
import { AppStore, Messages, TranslationResult} from '../types';
import Editor from './Editor';
import Opener from './Opener';
import Panel from './Panel';
import Search from './Search';
import SignIn from './SignIn';
import SignOut from './SignOut';
import User from './User';

export interface ApiCall {
  (method: 'put' | 'post' | 'delete' | 'get', endpoint: string, data?: any): Promise<any>;
}

export interface SetUser {
  (user?: User): void;
}
export interface SetError {
  (error?: string): void;
}
export interface UpdateTranslation {
  (key: string, text: string, keyPath?: string): void;
}

function convertDotPath(path: string, value: TranslationResult): any {
  const [last, ...paths] = path.split('.').reverse();
  return paths.reduce((acc, el) => ({ [el]: acc }), { [last]: value });
}

export interface TranslationEditorProps {
  history?: any;
  pathname?: string;
}

export interface TranslationEditorContext {
  translator: Translator;
  store: AppStore;
}

export interface User {
  username?: string;
  photo?: string;
  email?: string;
}

export interface TranslationEditorState {
  error?: string;
  opened: boolean;
  search: string;
  historyUnsubscribe?: () => void;
  locale: string;
  messages: Messages;
  pathname: string;
  user: User;
  translationStore: StoredTranslations;
  translatorSubscription: () => void;
  unsubscribeStore: () => void;
}

export class TranslationEditor extends React.PureComponent<TranslationEditorProps, TranslationEditorState> {

  context: TranslationEditorContext;

  static contextTypes = {
    translator: RPT.object,
    store: RPT.object,
  };

  state = {
    error: undefined,
    opened: false,
    search: '',
    historyUnsubscribe: undefined,
    messages: Map() as Messages,
    pathname: '/',
    locale: 'en',
    user: { username: undefined },
    translationStore: Map<string, Map<string, StoredTranslation>>(),
    translatorSubscription: () => {},
    unsubscribeStore: () => {},
  };

  componentWillMount() {
    const { store, translator } = this.context;

    const historyUnsubscribe = this.props.history ? this.props.history.listen(this.updateState) : undefined;

    if (!store) {
      return;
    }

    this.setState({
      unsubscribeStore: store.subscribe(this.updateState),
      translatorSubscription: translator.subscribeMsgClick(this.updateSearch),
      historyUnsubscribe,
    });

    this.updateState();
    this.loginOnMount();
  }

  componentWillReceiveProps(next: TranslationEditorProps) {
    if (next.pathname !== this.props.pathname) {
      this.updateState(next.pathname);
    }
  }

  componentWillUnmount() {
    const { unsubscribeStore, historyUnsubscribe, translatorSubscription } = this.state;

    if (unsubscribeStore) {
      unsubscribeStore();
    }
    if (historyUnsubscribe) {
      historyUnsubscribe();
    }
    if (translatorSubscription) {
      translatorSubscription();
    }
  }

  onChange = (keyPath: string) => (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { store: { dispatch } } = this.context;
    dispatch(updateMessages(convertDotPath(keyPath, event.target.value)));
  }

  setUser: SetUser = (user) => this.setState({ user: user || { username: undefined } as User });
  setError: SetError = (error) => this.setState({ error });
  togglOpen = () => this.setState({ opened: !this.state.opened });
  updateSearch = (search: string) => this.setState({ search });

  loginOnMount = () => {
    this.apiCall('get', '/api_frontend/v1/me').then((data) => {
      if (!data.error) {
        this.setUser(data.user);
      }
    });
  }

  apiCall: ApiCall = (method, endpoint, data = {}) => {
    const { translator: { connector } } = this.context;

    if (!connector) {
      return Promise.resolve({});
    }

    const { config: { apiUrl } } = connector;
    const url = [apiUrl, endpoint].join('/').replace(/(\w)\/+/g, '$1/');
    this.setError();
    return fetch(url, {
      method,
      body: method === 'get' ? null : JSON.stringify(data),
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    }).then((d: Response) => d.json()).catch((error: Error) => this.setError(JSON.stringify(error)));
  }

  updateState = (newPathname?: string) => {
    this.setState({
      messages: this.context.store.getState().translate.messages,
    });

    setTimeout(() => {
      const pathname = newPathname || window.location.pathname;
      const pathChanged = (this.state.pathname !== pathname);
      const search = pathChanged ? '' : this.state.search;
      const error = pathChanged ? '' : this.state.error;

      this.setState({
        translationStore: this.context.translator.connector && this.context.translator.connector.translationStore,
        locale: this.context.translator.__locale(),
        pathname,
        search,
        error,
      });
    }, 100);
  }

  updateTranslation: UpdateTranslation = (key, text) => {
    const { store: { getState }, translator: { connector } } = this.context;

    if (!connector) {
      return Promise.resolve({});
    }

    const { config: { apiToken } } = connector;

    return this.apiCall('put', '/api_frontend/v1/translations/update_by_key', {
      api_token: apiToken,
      locale: getState().translate.locale,
      key,
      translation: {
        text,
      },
    }).then((data) => {
      if (data.error) {
        this.setError(data.error);
      }
      return data;
    });
  }

  render() {
    const { translationStore, opened, locale, pathname, search, user, error } = this.state;
    const { children } = this.props;
    const { store: { getState, dispatch } } = this.context;

    return (
      <div style={style.wrapper}>
        <Opener open={this.togglOpen} width={PANEL_WIDTH} opened={opened} />
        <div style={[style.container, opened && style.containerMoved]}>
          {children}
        </div>

        <div style={[style.panel, opened && style.panelOpened]}>
          {opened && !user.username &&
            <SignIn
              error={error}
              apiCall={this.apiCall}
              setUser={this.setUser}
              setError={this.setError}
            />
          }
          {opened && user.username &&
            <Panel error={error}>
              <div style={style.navigation}>
                <User {...user} />
                <SignOut apiCall={this.apiCall} setUser={this.setUser} />
              </div>
              <Search search={search} onChange={(search) => this.setState({ search })} />
              <Editor
                dispatch={dispatch}
                messages={getState().translate.messages}
                locale={locale}
                pathname={pathname}
                search={search}
                translationStore={translationStore}
                updateTranslation={this.updateTranslation}
              />
              <Style
                rules={{
                  '.cnt': {
                    position: 'relative',
                  },
                  '.cnt:hover:after': {
                    opacity: 1,
                    transition: '0.5s all',
                  },
                  '.cnt:after': {
                    content: 'attr(data-key)',
                    background: 'black',
                    color: 'white',
                    position: 'absolute',
                    padding: '3px 5px',
                    fontSize: '12px',
                    letterSpacing: 'normal',
                    fontWeight: '400 !important',
                    left: 0,
                    bottom: '100%',
                    opacity: 0,
                  },
                }}
              />
            </Panel>
          }
        </div>
      </div>
    );
  }
}

const PANEL_WIDTH = 450;

export const style = {
  label: {
    fontSize: '12px',
    display: 'block',
    fontWeight: 600,
    marginBottom: '3px',
  } as React.CSSProperties,
  input: {
    border: `1px solid #555`,
    height: '34px',
    lineheight: '34px',
    padding: '5px',
    marginBottom: '15px',
    width: '100%',
  },
  button: {
    backgroundColor: '#111111',
    color: 'white',
    border: '1px solid #111111',
    fontWeight: 600,
    fontSize: '14px',
    padding: '6px 14px',
    transition: 'all .2s',
    ':hover': {
      cursor: 'pointer',
      backgroundColor: '#000000',
    },
  } as React.CSSProperties,
  wrapper: {
    position: 'relative',
  },
  container: {
    position: 'relative',
    transition: 'all .2s',
    marginRight: 0,
  },
  containerMoved: {
    marginRight: PANEL_WIDTH,
  },
  panel: {
    background: 'white',
    position: 'fixed',
    right: -PANEL_WIDTH,
    top: 0,
    bottom: 0,
    zIndex: 11,
    overflow: 'auto',
    width: PANEL_WIDTH,
    transition: 'all .2s',
  },
  panelOpened: {
    borderLeft: '3px solid #111111',
    right: 0,
    padding: '15px',
  },
  navigation: {
    position: 'absolute',
    top: '20px',
    right: '15px',
    maxWidth: '235px',
  },
};

export default Radium(TranslationEditor);
