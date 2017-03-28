import Cnt from './Cnt';
import { Translator, Msg, FormatDate, FormatNumber } from './translator';
import { Messages, MsgOptions } from './types';

import *  as React from 'react';

export interface CntFunc {
  (key: string, options?: MsgOptions): JSX.Element;
}

export interface TranslateProps {
  cnt: CntFunc;
  msg: Msg;
  formatDate: FormatDate;
  formatNumber: FormatNumber;
  formatCurrency: FormatNumber;
  formatPercentage: FormatNumber;
  translator: Translator;
  translateLocale: () => string;
  translateMessages: () => Messages;
}

export interface TranslateState {
  locale: string | null;
  messages: Messages | null;
  fallbackLocale: string | null;
}

export type TranslateDecorator<P> = (WrappedComponent: React.ComponentClass<P & TranslateProps>) => React.ComponentClass<P>;

export function translate<P>(scope?: string | string[], overrides?: MsgOptions): TranslateDecorator<P> {
  return (WrappedComponent) => {
    return class Translate extends React.Component<P, TranslateState> {

      static displayName = `Translate(${WrappedComponent && (WrappedComponent.displayName || WrappedComponent.name) || 'Component'})`;

      state = {
        locale: null,
        messages: null,
        fallbackLocale: null
      };

      static contextTypes = {
        store: React.PropTypes.object,
        translator: React.PropTypes.object
      };

      componentWillMount() {
        const { store } = this.context;
        if (!store) return;

        store.subscribe(this.updateState);
        this.updateState();
      }

      componentWillUnmount() {
        const { store } = this.context;
        if (store) store.unsubscribe(this.updateState);
      }

      updateState = () => {
        const { store } = this.context;
        const {messages, locale, fallbackLocale} = store.getState().translate;
        this.setState({ messages, locale, fallbackLocale });
      }

      // tslint:disable-next-line:typedef
      cnt: CntFunc = (key, options = {}) => {
        return (<Cnt content={this.msg(key, options)} />);
      }

      msg: Msg = (key, givenOptions) => {
        const options = givenOptions || {};
        const { translator } = this.context;

        const wantedScope = ([] as string[])
          .concat(scope || [], (options as MsgOptions).scope || [])
          .filter((x: any) => !!x)
          .join('.');

        return translator.msg(key, { ...options, ...overrides, scope: wantedScope });
      }

      getTranslateMethods() {
        const { translator } = this.context;
        const { formatDate,  formatCurrency, formatNumber, formatPercentage } = translator as Translator;

        return {
          cnt: this.cnt,
          msg: this.msg,
          formatDate,
          formatNumber,
          formatCurrency,
          formatPercentage,
          translator,
          translateLocale: translator.__locale(),
          translateMessages: translator.__messages()
        };
      }

      render() {
        return (
          <WrappedComponent
            {...this.getTranslateMethods()}
            {...this.props}
          />
        );
      }
    };
  };
}

export default translate;
