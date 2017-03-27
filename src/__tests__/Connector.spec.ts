import { fromJS } from 'immutable';
import Connector from '../Connector';

describe('Connector', () => {
  const config = {
    sync: true,
    apiUrl: 'http://translations.blueberry.io',
    apiToken: 'XYZ'
  };

  const dispatch = () => {};

  const createConnector = (pathname?: string) => new Connector(config, dispatch, pathname || '/');

  describe('updateLocation()', () => {
    it('should return new location', () => {
      const engine = createConnector();
      engine.updateLocation('/foo');
      expect(engine.currentLocation).toEqual('/foo');
    });
  });

  describe('__dataType()', () => {
    const Connector = createConnector();

    it('for object should return array', () => {
      expect(Connector.__dataType({})).toEqual('array');
    });

    it('for string should return string', () => {
      expect(Connector.__dataType('Foo')).toEqual('string');
    });

    it('for number (1) should return float', () => {
      expect(Connector.__dataType(1)).toEqual('float');
    });

    it('for number (13.4) should return float', () => {
      expect(Connector.__dataType(13.4)).toEqual('float');
    });

    it('for number (-1) should return float', () => {
      expect(Connector.__dataType(-1)).toEqual('float');
    });

    it('for number (0) should return float', () => {
      expect(Connector.__dataType(0)).toEqual('float');
    });

    it('for boolean (true) should return bool', () => {
      expect(Connector.__dataType(true)).toEqual('bool');
    });

    it('for boolean (false) should return bool', () => {
      expect(Connector.__dataType(false)).toEqual('bool');
    });
  });

  describe('sendTranslations()', () => {
    it('sends translations to server', () => {
      const Connector = createConnector('/foo-bar');
      Connector.rememberUsedTranslation('cs', ['foo'], 'Bar');
      Connector.rememberUsedTranslation('en', ['bar'], 'Foo');
      const stub = jest.fn();
      Connector.api = stub;

      expect(Connector.translationStore.toJS()).not.toEqual(Connector.previousTranslationsSend.toJS());

      Connector.sendTranslations();

      expect(stub.mock.calls[0]).toEqual([
        config,
        'POST',
        'translations',
        {
          locale: 'en',
          location: '/foo-bar',
          translations: [
            { data_type: 'string', key: 'cs.foo', text: 'Bar' },
            { data_type: 'string', key: 'en.bar', text: 'Foo' }
          ]
        }
      ]);

      expect(Connector.translationStore.toJS()).toEqual(Connector.previousTranslationsSend.toJS());

      Connector.rememberUsedTranslation('cs', ['foo.bar'], 'Foo-Bar');
      Connector.updateLocation('/bar');
      Connector.rememberUsedTranslation('en', ['foobar'], 'Foo Bar');

      Connector.sendTranslations();

      expect(stub.mock.calls[1]).toEqual([
        config,
        'POST',
        'translations',
        {
          locale: 'en',
          location: '/foo-bar',
          translations: [
            { data_type: 'string', key: 'cs.foo.bar', text: 'Foo-Bar' },
          ]
        }
      ]);

      expect(stub.mock.calls[2]).toEqual([
        config,
        'POST',
        'translations',
        {
          locale: 'en',
          location: '/bar',
          translations: [
            { data_type: 'string', key: 'en.foobar', text: 'Foo Bar' },
          ]
        }
      ]);
      expect(Connector.translationStore).toEqual(Connector.previousTranslationsSend);
    });
  });

  describe('rememberUsedTranslation()', () => {
    it('should not have sendTimeout when not called remember', () => {
      const Connector = createConnector('/foo-bar');
      expect(Connector.sendTimeout).toEqual(null);
    });

    it('should have sendTimeout when called', () => {
      const Connector = createConnector('/foo-bar');
      Connector.rememberUsedTranslation('cs', ['foo'], 'Bar');
      expect(Connector.sendTimeout).not.toEqual(null);
    });

    it('should change locale', () => {
      const Connector = createConnector('/foo-bar');
      Connector.rememberUsedTranslation('cs', ['foo'], 'Bar');
      expect(Connector.locale).toEqual('cs');
      Connector.rememberUsedTranslation('en', ['bar'], 'Foo');
      expect(Connector.locale).toEqual('en');
    });

    it('should remember translation in store', () => {
      const Connector = createConnector('/foo-bar');
      Connector.rememberUsedTranslation('cs', ['foo'], 'Bar');
      Connector.rememberUsedTranslation('en', ['bar'], 'Foo');

      expect(Connector.translationStore.toJS()).toEqual({
        '/foo-bar': {
          'cs.foo': {
            data_type: 'string',
            key: 'cs.foo',
            text: 'Bar'
          },
          'en.bar': {
            data_type: 'string',
            key: 'en.bar',
            text: 'Foo'
          }
        }
      });
    });

    it('should remember deep translation in store', () => {
      const Connector = createConnector('/foo-bar');
      Connector.rememberUsedTranslation('cs', ['foo'], fromJS({fo: 'Bar', bar: {fo: 'foBar'}}));

      expect(Connector.translationStore.toJS()).toEqual({
        '/foo-bar': {
          'cs.foo.fo': {
            data_type: 'string',
            key: 'cs.foo.fo',
            text: 'Bar'
          },
          'cs.foo.bar.fo': {
            data_type: 'string',
            key: 'cs.foo.bar.fo',
            text: 'foBar'
          },
        }
      });
    });
  });
});
