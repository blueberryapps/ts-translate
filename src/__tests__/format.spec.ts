import { defaultOptions, formatNumber, formatDate, mergeOptionsWithDefault, roundNumber } from '../format';
import * as moment from 'moment';
import 'moment/locale/es';
import 'moment/locale/cs';

describe('mergeOptionsWithDefault', () => {
  it('returns default options', () => {
    expect(mergeOptionsWithDefault({})).toEqual(defaultOptions);
  });

  it('enables to override options', () => {
    expect(mergeOptionsWithDefault({ precision: 3 }).precision).toEqual(3);
  });
});

describe('formatNumber', () => {
  [
    {
      input: 123.23,
      output: '123',
      options: { precision: 0 }
    },
    {
      input: 123.23,
      output: '123.2',
      options: { precision: 1 }
    },
    {
      input: 123.23,
      output: '123s2',
      options: { precision: 1, separator: 's' }
    },
    {
      input: 1231112.3,
      output: '1d231d112s3',
      options: { precision: 1, delimiter: 'd', separator: 's' }
    },
    {
      input: 98.3,
      output: '98.3 %',
      options: { precision: 1, template: '%n %' }
    },
    {
      input: 98.3,
      output: '98.3 %',
      options: { precision: 1, unit: '%', template: '%n %u' }
    },
    {
      input: 98.3,
      output: '98.3$',
      options: { precision: 1, unit: '$', template: '%n%u' }
    },
    {
      input: 98.3,
      output: '$98.3',
      options: { precision: 1, unit: '$', template: '%u%n' }
    }

  ].forEach(test => {
    it(`from: ${test.input} produce: ${test.output} with options: ${JSON.stringify(test.options)}`, () => {
      expect(formatNumber(test.input, test.options)).toEqual(test.output);
    });
  });
});

it('should convert number to rounded', () => {
  expect(roundNumber(20.1923, { precision: 0 })).toEqual(20);
  expect(roundNumber(20.1923, { precision: 1 })).toEqual(20.2);
  expect(roundNumber(20.1923, { precision: 2 })).toEqual(20.19);
  expect(roundNumber(20.1923, { precision: 3 })).toEqual(20.192);
});

describe('formatDate', () => {
  const date = moment('2017-02-28T12:58:20.006');
  const locale = 'en';

  it('should return default format for date', () => {
    expect(formatDate(date, locale)).toEqual('28.2.2017');
  });

  it('should return overriden format', () => {
    expect(formatDate(date, locale, 'MMMM Do YYYY, h:mm:ss a')).toEqual('February 28th 2017, 12:58:20 pm');
  });

  it('should return overriden format in es', () => {
    expect(formatDate(date, 'es', 'MMMM Do YYYY, h:mm:ss a')).toEqual('febrero 28º 2017, 12:58:20 pm');
  });

  it('should return overriden format in cs', () => {
    expect(formatDate(date, 'cs', 'MMMM Do YYYY, h:mm:ss a')).toEqual('únor 28. 2017, 12:58:20 pm');
  });
});
