import { Map } from 'immutable';

export type Messages = Map<string, Map<string, string>>;
export type TranslationResult = string | number | boolean | null | object;

export interface TranslatorOptions {
  messages: Messages;
  locale: string;
  fallbackLocale?: string;
}

export interface MsgOptions {
  scope: string;
}

export class Translator {
  messages = Map() as Messages;
  locale = 'en';
  fallbackLocale = 'en';

  constructor(options: TranslatorOptions) {
    this.messages = options.messages;
    this.locale = options.locale;
    this.fallbackLocale = options.fallbackLocale || this.fallbackLocale;
  }

  // tslint:disable-next-line:typedef
  msg = (key: string, options = {} as MsgOptions): TranslationResult => {
    const path = options.scope ? options.scope.split('.').concat(key) : [key];
    const result = this.__findTranslation(path) || key;

    return Map.isMap(result) ? (result as Messages).toJS() : result;
  }

  formatDate = () => {};
  formatCurrency = () => {};
  formatNumber = () => {};
  formatPercentage = () => {};

  __findTranslation(keys: string[]): TranslationResult | Messages {
    return this.messages.getIn([this.locale].concat(keys)) ||
      this.messages.getIn([this.fallbackLocale].concat(keys));
  }
}
