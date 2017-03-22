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

export type StateOptions = Map<string, string | number>;

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
    const splittedKey = key.split('.');
    const options = givenOptions || {};
    const path = options.scope ? options.scope.split('.').concat(splittedKey) : splittedKey;
    const result = this.__findTranslation(path) || key;

    return Map.isMap(result) ? (result as Messages).toJS() : result;
  }

  formatDate: FormatDate = (givenDate, customFormat) => {
    const keywordFormat = customFormat && this.__findTranslation(['formats', 'date', customFormat, 'format']);
    const defaultFormat = this.__findTranslation(['formats'].concat(['date', 'default', 'format']));
    const format = (keywordFormat || customFormat || defaultFormat || defaultFormats.formats.date.default.format) as string;

    return formatDate(givenDate, this.locale, format);
  }

  formatNumber: FormatNumber = (givenNumber, options) => {
    if (typeof options === 'string') {
      return formatNumber(givenNumber, this.__getOptions('number', options, {}));
    } else {
      return formatNumber(givenNumber, this.__getOptions('number', undefined, options));
    }
  }

  formatCurrency: FormatNumber = (givenNumber, options) => {
    const defaultFormat = this.__getOptions('number', 'currency', options);

    return formatNumber(givenNumber, defaultFormat);
  }

  formatPercentage: FormatNumber = (givenNumber, options) => {
    const defaultFormat = this.__getOptions('number', 'percentage', options);

    return formatNumber(givenNumber, defaultFormat);
  }

  // tslint:disable-next-line:typedef
  __getOptions(type: string, key?: string, overrideOptions: FormatOptions = {}): DefaultFormatOptions {
    const defaultTypeOptions = this.__findTranslation(['formats'].concat(type, 'default')) as StateOptions;

    const keyOptions = key && (this.__findTranslation(['formats'].concat(type, key)) as StateOptions);

    const result =  {
      ...defaultOptions,
      ...defaultFormats.formats[type].default,
      ...(key && defaultFormats.formats[type][key]),
      ...(defaultTypeOptions && defaultTypeOptions.toJS()),
      ...(keyOptions && keyOptions.toJS()),
      ...overrideOptions
    };

    return result;
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
