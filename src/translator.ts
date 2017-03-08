import { fromJS, Map } from 'immutable';
import { defaultOptions, DefaultFormatOptions, FormatOptions, formatDate, formatNumber, GivenDate } from './format';
import defaultFormats from './defaultFormats';

export type Messages = Map<string, Map<string, string>>;
export type TranslationResult = string | number | boolean | null | object;

export interface TranslatorOptions {
  locale: string;
  fallbackLocale?: string;
  messages?: Messages;
}

export interface MsgOptions {
  scope: string;
}

export class Translator {
  messages = Map() as Messages;
  locale = 'en';
  fallbackLocale = '';

  constructor(options: TranslatorOptions) {
    this.messages = options.messages || fromJS({ en: {}});
    this.locale = options.locale;
    this.fallbackLocale = options.fallbackLocale || this.fallbackLocale;
  }

  // tslint:disable-next-line:typedef
  msg = (key: string, options = {} as MsgOptions): TranslationResult => {
    const path = options.scope ? options.scope.split('.').concat(key) : [key];
    const result = this.__findTranslation(path) || key;

    return Map.isMap(result) ? (result as Messages).toJS() : result;
  }

  formatDate = (givenDate: GivenDate, customFormat?: string): string => {
    const keywordFormat = customFormat && this.__findTranslation(['formats', 'date', customFormat, 'format']);
    const defaultFormat = this.__findTranslation(['formats'].concat(['date', 'format']));
    const format = (keywordFormat || customFormat || defaultFormat || defaultFormats.formats.date.format) as string;

    return formatDate(givenDate, this.locale, format);
  }

  formatNumber = (givenNumber: number, options?: FormatOptions) => {
    return formatNumber(givenNumber, this.__getOptions(['number'], defaultOptions, options));
  }

  formatCurrency = (givenNumber: number, options?: FormatOptions) => {
    const defaultFormat = this.__getOptions(
      ['number', 'currency'],
      { ...defaultOptions, ...defaultFormats.formats.number.currency },
      options
    );

    return formatNumber(givenNumber, defaultFormat);
  }

  formatPercentage = (givenNumber: number, options?: FormatOptions) => {
    const defaultFormat = this.__getOptions(
      ['number', 'percentage'],
      { ...defaultOptions, ...defaultFormats.formats.number.percentage },
      options
    );

    return formatNumber(givenNumber, defaultFormat);
  }

  // tslint:disable-next-line:typedef
  __getOptions(keys: string[], givenDefaultOptions: DefaultFormatOptions, overrideOptions = {} as FormatOptions): DefaultFormatOptions {
    const options = this.__findTranslation(['formats'].concat(keys));

    if (options) {
      return { ...givenDefaultOptions, ...(options as Messages).toJS(), ...overrideOptions };
    }
    return { ...givenDefaultOptions, ...overrideOptions };
  }

  __findTranslation(keys: string[]): TranslationResult | Messages {
    return this.messages.getIn([this.locale].concat(keys)) ||
      this.messages.getIn([this.fallbackLocale].concat(keys));
  }
}
