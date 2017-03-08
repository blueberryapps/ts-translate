import { fromJS } from 'immutable';
import { Translator, Messages } from '../translator';

const locale = 'en';
const messages = fromJS({
  en: {
    'Homepage headline': 'Super headline',
    homepage: {
      'Homepage headline': 'Super headline under scope',
    },
    deep: {
      scope: {
        'Homepage headline': 'Super headline under deep scope',
      }
    }
  },
  es: {
    'Homepage headline': 'Super titular'
  }
}) as Messages;

it('should return default text', () => {
  expect(new Translator({ messages, locale }).msg('Not translated')).toEqual('Not translated');
});

it('should return text from messages', () => {
  expect(new Translator({ messages, locale }).msg('Homepage headline')).toEqual('Super headline');
});

describe('Using scope', () => {
  it('should return text from messages with scope', () => {
    expect(new Translator({ messages, locale }).msg('Homepage headline', { scope: 'homepage' })).toEqual('Super headline under scope');
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
    expect(new Translator({ messages, locale: 'es' }).msg('Homepage headline')).toEqual('Super titular');
  });

  it('should return fallback text in default en from messages', () => {
    expect(new Translator({ messages, locale: 'es' }).msg('Homepage headline', { scope: 'homepage' })).toEqual('Super headline under scope');
  });

  it('should return default text when not found in locale and defaultLocale', () => {
    expect(new Translator({ messages, locale: 'es' }).msg('Not translated')).toEqual('Not translated');
  });
});
