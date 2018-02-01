import * as PropTypes from 'prop-types';
import * as React from 'react';
import Connector from './Connector';
import { Translator } from './translator';
import { ApiConfig } from './types';

export interface ProviderProps {
  config?: ApiConfig;
  pathname?: string;
  history?: any;
}

export interface ProviderState {
  historyUnsubscribe?: () => void;
}

export class Provider extends React.Component<ProviderProps, ProviderState> { // eslint-disable-line react/no-multi-comp
  static defaultProps = {
    config: {},
    pathname: typeof window !== 'undefined' ? `${window.location.pathname}` : '/',
  };

  state = {
    historyUnsubscribe: undefined,
  };

  connector?: Connector = undefined;
  translator?: Translator = undefined;

  static contextTypes = {
    store: PropTypes.object,
  };

  static childContextTypes = {
    translator: () => {},
  };

  componentWillMount() {
    this.setState({
      historyUnsubscribe: this.props.history ? this.props.history.listen(this.updateLocation) : undefined,
    });
  }

  updateLocation = () => {
    if (this.connector) {
      this.connector.updateLocation(window.location.pathname);
    }
  }

  componentWillUpdate(nextProps: ProviderProps) {
    if (nextProps.pathname && this.connector && nextProps.pathname !== this.props.pathname) {
      this.connector.updateLocation(nextProps.pathname);
    }
  }

  getChildContext() {
    const { store } = this.context;
    const { config, pathname } = this.props;

    if (!this.connector) {
      const apiConfig = { apiEndpoint: 'api/v1/translations', ...config };
      this.connector = (config && config.sync)
        ? new Connector(apiConfig, store.dispatch, pathname)
        : undefined;
    }

    if (!this.translator) {
      this.translator = new Translator(store, this.connector);
    }

    return {
      translator: this.translator,
    };
  }

  render() {
    return this.props.children as JSX.Element;
  }

}

export default Provider;
