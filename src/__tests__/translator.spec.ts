import { fromJS } from 'immutable';
import * as moment from 'moment';
import { Translator } from '../translator';
import { Messages } from '../types';

const locale = 'en';
const messages = fromJS({
  en: {
    'Homepage headline': 'Super headline',
    'Interpolated string': 'This was interpolated: %{foo}',
    homepage: {
      'Homepage headline': 'Super headline under scope',
    },
    deep: {
      'scopedTransInterpolation': '%{foo} (again)',
      scope: {
        'Homepage headline': 'Super headline under deep scope',
      }
    },
    formats: {
      date: {
        default: {
          format: 'D.M.YYYY',
        },
        short: {
          format: 'D.M.YYYY'
        },
        long: {
          format: 'H:m:s D.M.YYYY'
        }
      },
      number: {
        default: {
          precision: 10
        },
        currency: {
          unit: '$'
        },
        percentage: {
          template: '%n %'
        }
      }
    }
  },
  es: {
    'Homepage headline': 'Super titular'
  },
}) as Messages;

it('should return default text', () => {
  expect(new Translator({ messages, locale }).msg('Not translated')).toEqual('Not translated');
});

it('should return null when disabledDefault', () => {
  expect(new Translator({ messages, locale }).msg('Not translated', { disableDefault: true })).toEqual(null);
});

it('should return text from messages', () => {
  expect(new Translator({ messages, locale }).msg('Homepage headline')).toEqual('Super headline');
});

describe('Using array as keys for fallbacking', () => {
  it('should return text from first found key', () => {
    expect(new Translator({ messages, locale }).msg(['deep.scope.Homepage headline', 'homepage.Homepage headline'])).toEqual('Super headline under deep scope');
    expect(new Translator({ messages, locale }).msg(['deep.scope.unknown', 'homepage.Homepage headline'])).toEqual('Super headline under scope');
  });

  it('should return default text from first not found key', () => {
    expect(new Translator({ messages, locale }).msg(['deep.scope.unknown', 'homepage.unknown'])).toEqual('deep.scope.unknown');
  });
});

describe('Using scope', () => {
  it('should return text from messages with scope', () => {
    expect(new Translator({ messages, locale }).msg('Homepage headline', { scope: 'homepage' })).toEqual('Super headline under scope');
  });

  it('should return text from messages with nested key path', () => {
    expect(new Translator({ messages, locale }).msg('homepage.Homepage headline')).toEqual('Super headline under scope');
  });

  it('should return text from messages with nested array key', () => {
    expect(new Translator({ messages, locale }).msg(['homepage', 'Homepage headline'])).toEqual('Super headline under scope');
  });

  it('should return default text from messages with unknown scope', () => {
    expect(new Translator({ messages, locale }).msg('Homepage headline', { scope: 'unknown' })).toEqual('Homepage headline');
  });

  it('should return text from messages with deep scope', () => {
    expect(new Translator({ messages, locale }).msg('Homepage headline', { scope: 'deep.scope' })).toEqual('Super headline under deep scope');
  });

  it('should return object containing all messages under given key', () => {
    expect(new Translator({ messages, locale }).msg('deep')).toEqual(messages.getIn(['en', 'deep']).toJS());
  });
});

describe('Fallbacking locales', () => {
  it('should return text in es from messages', () => {
    expect(new Translator({ messages, locale: 'es', fallbackLocale: 'en' }).msg('Homepage headline')).toEqual('Super titular');
  });

  it('should return fallback text in default en from messages', () => {
    expect(new Translator({ messages, locale: 'es', fallbackLocale: 'en' }).msg('Homepage headline', { scope: 'homepage' })).toEqual('Super headline under scope');
  });

  it('should return default text when not found in locale and defaultLocale', () => {
    expect(new Translator({ messages, locale: 'es', fallbackLocale: 'en' }).msg('Not translated')).toEqual('Not translated');
  });
});

describe('formatDate', () =>  {
  const date = moment('2017-02-28T12:58:20.006');

  it('returns formatted date with only defaults', () =>  {
    expect(new Translator({ locale }).formatDate(date)).toEqual('28.2.2017');
  });

  it('returns formatted date for existing options', () =>  {
    expect(new Translator({ messages, locale }).formatDate(date)).toEqual('28.2.2017');
  });

  it('returns formatted date for nonexisting options', () =>  {
    expect(new Translator({ messages, locale: 'es' }).formatDate(date)).toEqual('28.2.2017');
  });

  it('returns formatted date with custom format', () =>  {
    expect(new Translator({ messages, locale: 'es' }).formatDate(date, 'YYYY')).toEqual('2017');
  });

  it('returns formatted date with keyword format', () =>  {
    expect(new Translator({ messages, locale: 'en' }).formatDate(date, 'short')).toEqual('28.2.2017');
    expect(new Translator({ messages, locale: 'en' }).formatDate(date, 'long')).toEqual('12:58:20 28.2.2017');
  });
});

describe('formatNumber', () =>  {
  it('returns formatted number with only defaults', () =>  {
    expect(new Translator({ locale }).formatNumber(123456.789)).toEqual('123,456.789');
  });

  it('returns formatted number without any options', () =>  {
    expect(new Translator({ messages, locale }).formatNumber(123456.789)).toEqual('123,456.789');
  });

  it('returns formatted number with options in messages', () =>  {
    expect(new Translator({ messages: messages.setIn(['en', 'formats', 'number', 'default', 'template'], '%n %'), locale }).formatNumber(123456.789)).toEqual('123,456.789 %');
  });

  it('returns formatted number with currency option', () =>  {
    expect(new Translator({ messages, locale }).formatNumber(123456.789, 'currency')).toEqual('123,456.789 $');
  });

  it('returns formatted number with percentage option', () =>  {
    expect(new Translator({ messages, locale }).formatNumber(123456.789, 'percentage')).toEqual('123,456.789 %');
  });

  it('returns formatted number with override options', () =>  {
    expect(new Translator({ messages, locale }).formatNumber(123456.789, { template: '$ %n' })).toEqual('$ 123,456.789');
  });
});

describe('formatCurrency', () =>  {
  it('returns formatted number with only defaults', () =>  {
    expect(new Translator({ locale }).formatCurrency(123456.789)).toEqual('123,456.789 $');
  });

  it('returns formatted number without any options', () =>  {
    expect(new Translator({ messages, locale }).formatCurrency(123456.789)).toEqual('123,456.789 $');
  });

  it('returns formatted number with options in messages', () =>  {
    expect(new Translator({ messages: messages.setIn(['en', 'formats', 'number', 'currency', 'unit'], '€'), locale }).formatCurrency(123456.789)).toEqual('123,456.789 €');
  });

  it('returns formatted number with override options', () =>  {
    expect(new Translator({ messages, locale }).formatCurrency(123456.789, { template: '€ %n' })).toEqual('€ 123,456.789');
  });
});

describe('formatPercentage', () =>  {
  it('returns formatted number with only defaults', () =>  {
    expect(new Translator({ locale }).formatPercentage(123456.789)).toEqual('123,456.789 %');
  });

  it('returns formatted number without any options', () =>  {
    expect(new Translator({ messages, locale }).formatPercentage(123456.789)).toEqual('123,456.789 %');
  });

  it('returns formatted number with options in messages', () =>  {
    expect(new Translator({ messages: messages.setIn(['en', 'formats', 'number', 'percentage', 'template'], '% %n'), locale }).formatPercentage(123456.789)).toEqual('% 123,456.789');
  });

  it('returns formatted number with override options', () =>  {
    expect(new Translator({ messages, locale }).formatPercentage(123456.789, { template: '% %n' })).toEqual('% 123,456.789');
  });
});

describe('interpolation', () => {
  it('detects interpolation', () => {
    expect(new Translator({ messages, locale }).__hasInterpolation('this has interpolation %{foo}')).toBeTruthy();
  });

  it('detects interpolation (key must be present)', () => {
    expect(new Translator({ messages, locale }).__hasInterpolation('this is not interpolation %{}')).toBeFalsy();
  });

  it('returns interpolated string when no translations is present', () => {
    expect(new Translator({ messages, locale }).msg('Not translated yet %{status}', { status: 'interpolated' })).toEqual('Not translated yet interpolated');
  });

  it('returns translated interpolated string', () => {
    expect(new Translator({ messages, locale }).msg('Interpolated string', { foo: 'bar' })).toEqual('This was interpolated: bar');
  });

  it('handles combination of interpolation dictionary and message options', () => {
    expect(new Translator({ messages, locale }).msg('scopedTransInterpolation', { scope: 'deep', foo: 'BAR!' })).toEqual('BAR! (again)');
  });
});
