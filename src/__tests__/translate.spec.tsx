/* eslint-disable react/no-multi-comp */
import { translate, TranslateProps } from '../translate';
import * as TestUtils from 'react-addons-test-utils';
import TranslateProvider from '../Provider';
import * as React from 'react';
import reducer from '../reducer';
import { createStore } from 'redux';
import { Provider as ReduxProvider } from 'react-redux';
import { TranslateAction } from '../actions';
import { TranslatorOptions } from '../types';
import { fromJS  } from 'immutable';

const initial: TranslatorOptions = {
  messages: fromJS({
    cs: { home: { description: 'Foo', fallback: 'Fallback' } },
    en: { home: { description: 'enFoo', about: 'Bar' } }
  }),
  locale: 'cs',
  fallbackLocale: 'en'
};

const store = createStore(({}, action: TranslateAction) => ({ translate: reducer(initial, action) }));

describe('Translate Decorator', () => {
  class Passthrough extends React.Component<any, {}> {
    render() {
      return <div />;
    }
  }

  class Container extends React.Component<TranslateProps, void> {
    render() {
      return (
        <Passthrough {...this.props} />
      );
    }
  }

  const DecoratedContainer = translate<{}>(Container);

  const container = TestUtils.renderIntoDocument(
    <ReduxProvider store={store}>
      <TranslateProvider >
        <DecoratedContainer />
      </TranslateProvider>
    </ReduxProvider>
  ) as  React.Component<{}, {}>;

  const stub = TestUtils.findRenderedComponentWithType(container, Passthrough);

  it('should have a msg prop', () => {
    expect(stub.props.msg('description', { scope: 'home' })).toEqual('Foo');
  });
});
