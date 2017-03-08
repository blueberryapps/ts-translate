import * as React from 'react';
import { Translator } from './translator';

class Provider extends React.Component<void, void> { // eslint-disable-line react/no-multi-comp
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

    return {
      translator: new Translator(store)
    };
  }

  render() {
    return this.props.children as JSX.Element;
  }

}

export default Provider;
