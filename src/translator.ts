import { fromJS, Map } from 'immutable';
import { defaultOptions, DefaultFormatOptions, FormatOptions, formatDate, formatNumber, GivenDate } from './format';
import defaultFormats from './defaultFormats';
import { AppStore, TranslatorOptions, Messages, MsgOptions, TranslationResult } from './types';

export interface Msg {
  (key: string, options?: MsgOptions): TranslationResult;
}

export interface FormatDate {
  (givenDate: GivenDate, customFormat?: string): string;
}

export interface FormatNumber {
  (givenNumber: number, options?: FormatOptions): string;
}

function isAppStore(x: any): x is AppStore {
  return (x && typeof x.getState === 'function');
}

export class Translator {
  messages = Map() as Messages;
  locale = 'en';
  fallbackLocale = '';
  store: AppStore | null = null;

  constructor(options: TranslatorOptions | AppStore) {
    if (isAppStore(options)) {
      this.store = options;
    } else {
      this.messages = options.messages || fromJS({ en: {}});
      this.locale = options.locale;
      this.fallbackLocale = options.fallbackLocale || this.fallbackLocale;
    }
  }
  // tslint:disable-next-line:typedef
  msg: Msg = (key, givenOptions) => {
    const options = givenOptions || {};
    const path = options.scope ? options.scope.split('.').concat(key) : [key];
    const result = this.__findTranslation(path) || key;

    return Map.isMap(result) ? (result as Messages).toJS() : result;
  }

  formatDate: FormatDate = (givenDate, customFormat) => {
    const keywordFormat = customFormat && this.__findTranslation(['formats', 'date', customFormat, 'format']);
    const defaultFormat = this.__findTranslation(['formats'].concat(['date', 'format']));
    const format = (keywordFormat || customFormat || defaultFormat || defaultFormats.formats.date.format) as string;

    return formatDate(givenDate, this.locale, format);
  }

  formatNumber: FormatNumber = (givenNumber, options) => {
    return formatNumber(givenNumber, this.__getOptions(['number'], defaultOptions, options));
  }

  formatCurrency: FormatNumber = (givenNumber, options) => {
    const defaultFormat = this.__getOptions(
      ['number', 'currency'],
      { ...defaultOptions, ...defaultFormats.formats.number.currency },
      options
    );

    return formatNumber(givenNumber, defaultFormat);
  }

  formatPercentage: FormatNumber = (givenNumber, options) => {
    const defaultFormat = this.__getOptions(
      ['number', 'percentage'],
      { ...defaultOptions, ...defaultFormats.formats.number.percentage },
      options
    );

    return formatNumber(givenNumber, defaultFormat);
  }

  // tslint:disable-next-line:typedef
  __getOptions(keys: string[], givenDefaultOptions: DefaultFormatOptions, overrideOptions: FormatOptions = {}): DefaultFormatOptions {
    const options = this.__findTranslation(['formats'].concat(keys));

    if (options) {
      return { ...givenDefaultOptions, ...(options as Messages).toJS(), ...overrideOptions };
    }
    return { ...givenDefaultOptions, ...overrideOptions };
  }

  __findTranslation(keys: string[]): TranslationResult | Messages {
    return this.__messages().getIn([this.__locale()].concat(keys)) ||
      this.__messages().getIn([this.__fallbackLocale()].concat(keys));
  }

  __locale() {
    if (this.store) {
      return this.store.getState().translate.locale;
    } else {
      return this.locale;
    }
  }

  __fallbackLocale() {
    if (this.store) {
      return this.store.getState().translate.fallbackLocale;
    } else {
      return this.fallbackLocale;
    }
  }

  __messages(): Messages {
    if (this.store) {
      return this.store.getState().translate.messages as Messages;
    }

    return this.messages || fromJS({});
  }
}
