import createCnt from './createCnt';
import { FormatDate, FormatNumber, Msg, Resolve, Translator } from './translator';
import { Messages, MsgOptions, TranslationResult } from './types';

import *  as React from 'react';

export interface TextFunc {
  (key: string, options?: MsgOptions): string;
}

export interface CntFunc {
  (key: string, options?: MsgOptions): JSX.Element;
}

export interface HasMsgFunc {
  (key: string, options?: MsgOptions): boolean;
}

export interface TranslateProps {
  cnt: CntFunc;
  msg: CntFunc;
  text: TextFunc;
  hasMsg: HasMsgFunc;
  resolveMsg: Resolve;
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
  messages: TranslationResult | null;
  fallbackLocale: string | null;
  unsubscribeStore: () => void;
}

export type TranslateDecorator<P> = (WrappedComponent: React.ComponentClass<P & TranslateProps>) => React.ComponentClass<P>;

export function translate<P>(scope?: string | string[], overrides?: MsgOptions): TranslateDecorator<P> {
  return (WrappedComponent) => {
    return class Translate extends React.PureComponent<P, TranslateState> {

      static displayName = `Translate(${WrappedComponent && (WrappedComponent.displayName || WrappedComponent.name) || 'Component'})`;

      state = {
        locale: null,
        messages: null,
        fallbackLocale: null,
        unsubscribeStore: () => {},
      };

      static contextTypes = {
        store: React.PropTypes.object,
        translator: React.PropTypes.object,
      };

      componentWillMount() {
        const { store } = this.context;
        if (!store) {
          return;
        }

        this.setState({
          unsubscribeStore: store.subscribe(this.updateState),
        });

        this.updateState();
      }

      componentWillUnmount() {
        const { unsubscribeStore } = this.state;

        if (unsubscribeStore) {
          unsubscribeStore();
        }
      }

      updateState = () => {
        const { store } = this.context;
        const { locale, fallbackLocale, messages } = store.getState().translate;

        this.setState({ messages, locale, fallbackLocale });
      }

      resolveMsg: Resolve = (key, givenOptions = {}) => {
        const options = givenOptions || {};
        const { translator } = this.context;

        const wantedScope = ([] as string[])
          .concat(scope || [], (options as MsgOptions).scope || [])
          .filter((x: any) => !!x)
          .join('.');

        return translator.resolve(key, { ...options, ...overrides, scope: wantedScope });
      }

      // tslint:disable-next-line:typedef
      text: TextFunc = (key, options = {}) => `${this.resolveMsg(key, options).result}`;

      // tslint:disable-next-line:typedef
      cnt: CntFunc = (key, options = {}) => this.msg(key, options);

      // tslint:disable-next-line:typedef
      msg: CntFunc = (key, options = {}) => {
        const { translator } = this.context;
        const { result, usedKey } = this.resolveMsg(key, options);

        return createCnt(usedKey, result, translator.onMsgClick);
      }

      hasMsg: HasMsgFunc = (key, options = {}) => {
        const { result } = this.resolveMsg(key, { ...options, disableDefault: true });
        return !!result && `${result}`.length > 0;
      }

      getTranslateMethods() {
        const { translator } = this.context;
        const { formatDate,  formatCurrency, formatNumber, formatPercentage } = translator as Translator;

        return {
          cnt: this.cnt,
          msg: this.msg,
          text: this.text,
          hasMsg: this.hasMsg,
          resolveMsg: this.resolveMsg,
          formatDate,
          formatNumber,
          formatCurrency,
          formatPercentage,
          translator,
          translateLocale: translator.__locale(),
          translateMessages: translator.__messages(),
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
