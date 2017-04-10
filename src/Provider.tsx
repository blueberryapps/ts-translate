import * as React from 'react';
import Connector from './Connector';
import { Translator } from './translator';
import { ApiConfig } from './types';

export interface ProviderProps {
  config?: ApiConfig;
  pathname?: string;
}

export class Provider extends React.Component<ProviderProps, void> { // eslint-disable-line react/no-multi-comp
  static defaultProps = {
    config: {},
    pathname: typeof window !== 'undefined' ? `${window.location.pathname}` : '/'
  };

  connector?: Connector = undefined;

  static contextTypes = {
    store: React.PropTypes.object
  };

  static childContextTypes = {
    translator: () => {}
  };

  componentWillUpdate(nextProps: ProviderProps) {
    if (nextProps.pathname && this.connector && nextProps.pathname !== this.props.pathname) {
      this.connector.updateLocation(nextProps.pathname);
    }
  }

  getChildContext() {
    const { store } = this.context;
    const { config, pathname } = this.props;

    if (!this.connector) {
      this.connector = (config && config.sync)
        ? new Connector(config, store.dispatch, pathname)
        : undefined;
    }

    return {
      translator: new Translator(store, this.connector)
    };
  }

  render() {
    return this.props.children as JSX.Element;
  }

}

export default Provider;
