# Translate

```
yarn add ts-translate
```

## Vanila JS usage

```javascript
import { fromJS } from 'immutable';
import { Translator } from 'ts-translate';


const translator = new Translator({
  messages: fromJS({
    en: {
      foo: 'bar',
      bar: {
        foo: 'FooBar'
        'Some Headline': 'Super Headline'
      }
    }
  }),
  locale: 'en'
});

translator.msg('foo') // => 'bar'
translator.msg('foo', { scope: 'bar' }) // => 'bar'
translator.msg('Some headline') // Not found will return text in first argument => 'Some headline'
translator.msg('Some headline', { scope: 'bar' }) // => 'Super Headline'

translator.msg('Not found text', { disableDefault: true })
// => Will not return default text (Not found text) instead it will return 'null'

translator.formatNumber(123456.78) // => 123,456.78
translator.formatNumber(123456.78, {precision: 1}) // => 123,456.8
translator.formatNumber(123456.78, {precision: 0}) // => 123,457
translator.formatNumber(123456.78, {delimiter: '.', separator: ','}) // => 123.456,78
translator.formatNumber(123456.78, {template: '%n %u', unit: '%'}) // => 123.456,78 %
translator.formatNumber(123456.78, {template: '%n $'}) // => 123.456,78 $

translator.formatCurrency(123456.78, {unit: '€'}) // => 123.456,78 €
translator.formatPercentage(123456.78) // => 123.456,78 %

translator.formatDate(new Date, 'M.D. YYYY') // => 28.2. 2017 -> using moment.js syntax
translator.formatDate(new Date, 'short') // => 28.2. 2017 -> using aliases (look down to Formats specification)
```

## React + Redux

```javascript
import { Provider as TranslateProvider, translate, reducer } from 'ts-translate';
import { fromJS } from 'immutable'
import { createStore, combineReducers } from 'redux';
import { Provider as ReduxProvider } from 'react-redux';

const initial = {
  messages: fromJS({
    cs: { home: { description: 'Foo', fallback: 'Fallback' } },
    en: { home: { description: 'enFoo', about: 'Bar' } }
  }),
  locale: 'cs',
  fallbackLocale: 'en'
};

const store = createStore(combineReducers({ translate: reducer }), { translate: initial});

class MyComponent extends React.Component {
  render() {
    const { msg } = this.props;
    return (<div>{msg('Something nice')}</div>);
  }
}

const TranslatedMyComponent = translate()(MyComponent);
const TranslatedScopedMyComponent = translate('homepage')(MyComponent);

<ReduxProvider store={store} >
  <TranslateProvider>
    <TranslatedMyComponent /> // will look for key 'Something nice' in root of locale messages
    <TranslatedScopedMyComponent /> // will look for key 'Something nice' in homepage scope of locale messages
  </TranslateProvider>
</ReduxProvider>
```


## Formats Spefication

you can modify default formatting options by specifying:
```javascript
{
  messages fromJS({
    en: {
      formats: {
        date: {
          default: { // formatDate(new Date)
            format: 'D.M.YYYY',
          },
          shortTime: { // formatDate(new Date, 'short')
            format: 'H:m'
          },
          long: { // formatDate(new Date, 'long')
            format: 'D.M.YY H:m:s'
          }
        },
        number: {
          default: {
            precision: 2
          },
          currency: { // formatNumber(123, 'percentage') === formatPercentage(123)
            unit: '€'
          },
          percentage: { // formatNumber(123, 'percentage') === formatPercentage(123)
            template: '%n %'
          },
          custom: { // formatNumber(123, 'custom')
            precision: 3
          }
        }
      }
    }
  })
}
```

this will enable you to use:
```javascript
translator.formatNumber(123456.78) // => 123,456.78
translator.formatNumber(123456.78, 'currency') // => 123,456.78 € -> using alias
translator.formatCurrency(123456.78) // => 123.456,78 €
translator.formatPercentage(123456.78) // => 123.456,78 %

translator.formatDate(new Date, 'shortTime') // => 19:23 -> using alias
translator.formatDate(new Date, 'long') // => 28.2.2017 19:23:16 -> using alias
```

## Translation server

Enable application to send and receive translations from Translation server.

- __apiUrl__ - url to translation server
- __apiToken__ - project token is needed for enabling synchronization
- __sync__ - enable synchronization of translations (remembers translations, sends them to server and receives translations back)
- __liveSync__ - enable Server Side Events for instant refresh of translations directly after update in translation server
- __releasesDir__ - directory to store releases (needed for releases workflow)

### Task for communicating with Translation server

Enables you to list and download releases to your project.

```
yarn translate-list // List all created releases
yarn translate-fetch // Download one specified release (for locale) to specified folder
```

Both commands supports taking `apiToken` and `apiUrl` from ENV variables (`TRANSLATE_API_TOKEN`, `TRANSLATE_API_URL`) or command line (`--apiToken`, `--apiUrl`) arguments
