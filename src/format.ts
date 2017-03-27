import * as moment from 'moment';

export interface FormatOptions {
  precision?: number;
  delimiter?: string;
  format?: string;
  separator?: string;
  template?: string;
  unit?: string;
  trimTrailingZeros?: boolean;
}

export interface DefaultFormatOptions {
  precision: number;
  delimiter: string;
  format: string;
  separator: string;
  template: string;
  unit: string;
  trimTrailingZeros: boolean;
}

export type GivenDate = Date | moment.Moment | string;

export const defaultDateFormat = 'D.M.YYYY';

export const defaultOptions: DefaultFormatOptions = {
  precision: 10,
  delimiter: ',', // used in 10,000,000.10
  format: defaultDateFormat,
  separator: '.', // used in 10.10
  template: '%n %u', // %n is placeholder for number, %u is for unit
  unit: '',
  trimTrailingZeros: true,
};

export function mergeOptionsWithDefault(givenOptions: FormatOptions): DefaultFormatOptions {
  return { ...defaultOptions, ...givenOptions };
}

export function formatDate(givenDate: GivenDate, locale: string, format?: string) {
  const date = moment(givenDate);
  date.locale(locale);
  return date.format(format || defaultDateFormat);
}

export function formatNumber(input: number, givenOptions: FormatOptions = {}) {
  const options = mergeOptionsWithDefault(givenOptions);

  const rounedNumber = roundNumber(input, options);
  const formattedNumber = formatNumberSeparatorAndDelimiter(rounedNumber, options);

  if (formattedNumber === 'NaN') return '';

  return options.template
    .replace('%n', formattedNumber)
    .replace('%u', options.unit)
    .trim();
}

export function formatCurrency(input: number, givenOptions: FormatOptions = {}) {
  return formatNumber(input, { trimTrailingZeros: false, ...givenOptions });
}

export function formatNumberSeparatorAndDelimiter(input: number, givenOptions: FormatOptions = {}): string {
  const options = mergeOptionsWithDefault(givenOptions);
  const numbers = input.toFixed(givenOptions.precision).toString().split('.');

  numbers[0] = numbers[0].replace(/\B(?=(\d{3})+(?!\d))/g, options.delimiter);

  if (numbers[1] && givenOptions.trimTrailingZeros) {
    numbers[1] = numbers[1].replace(/0+$/g, '');
    if (numbers[1] === '') {
      numbers.splice(1, 1);
    }
  }

  return numbers.join(options.separator);
}

export function roundNumber(input: number, givenOptions: FormatOptions): number {
  const options = mergeOptionsWithDefault(givenOptions);
  const decimal = Math.pow(10, options.precision);
  return Math.round(input * decimal) / decimal;
}
