import * as moment from 'moment';

interface FormatOptions {
  precision?: number;
  delimiter?: string;
  separator?: string;
  template?: string;
  unit?: string;
}

interface DefaultFormatOptions {
  precision: number;
  delimiter: string;
  separator: string;
  template: string;
  unit: string;
}

export const defaultOptions: DefaultFormatOptions = {
  precision: 10,
  delimiter: ',', // used in 10,000,000.10
  separator: '.', // used in 10.10
  template: '%n %u', // %n is placeholder for number, %u is for unit
  unit: '',
};

export const defaultDateFormat = 'D/M YYYY';

export function mergeOptionsWithDefault(givenOptions: FormatOptions): DefaultFormatOptions {
  return { ...defaultOptions, ...givenOptions };
}

export function formatDate(givenDate: Date | moment.Moment, locale: string, format?: string) {
  const date = moment(givenDate);
  date.locale(locale);
  return date.format(format || defaultDateFormat);
}

export function formatNumber(input: number, givenOptions: FormatOptions) {
  const options = mergeOptionsWithDefault(givenOptions);

  const rounedNumber = roundNumber(input, options);
  const formattedNumber = formatNumberSeparatorAndDelimiter(rounedNumber, options);

  if (formattedNumber === 'NaN') return '';

  return options.template
    .replace('%n', formattedNumber)
    .replace('%u', options.unit)
    .trim();
}

export function formatNumberSeparatorAndDelimiter(input: number, givenOptions: FormatOptions): string {
  const options = mergeOptionsWithDefault(givenOptions);
  const numbers = input.toString().split('.');

  numbers[0] = numbers[0].replace(/\B(?=(\d{3})+(?!\d))/g, options.delimiter);

  return numbers.join(options.separator);
}

export function roundNumber(input: number, givenOptions: FormatOptions): number {
  const options = mergeOptionsWithDefault(givenOptions);
  const decimal = Math.pow(10, options.precision);
  return Math.round(input * decimal) / decimal;
}
