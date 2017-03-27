import * as React from 'react';
import Connector from './Connector';
import { Translator } from './translator';
import { ApiConfig } from './types';

export interface ProviderProps {
  config?: ApiConfig;
}

export class Provider extends React.Component<ProviderProps, void> { // eslint-disable-line react/no-multi-comp
  static defaultProps = {
    config: {}
  };

  static contextTypes = {
    store: React.PropTypes.object
  };

  static childContextTypes = {
    translator: () => {}
  };

  getChildContext() {
    const { store } = this.context;
    const { config } = this.props;
    const location: string = typeof window !== 'undefined' ? `${window.location}` : '/';
    const connector = (config && config.sync) ? new Connector(config, store.dispatch, location) : undefined;

    return {
      translator: new Translator(store, connector)
    };
  }

  render() {
    return this.props.children as JSX.Element;
  }

}

export default Provider;
