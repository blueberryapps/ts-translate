import { fromJS  } from 'immutable';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { Component } from 'react';
import * as TestUtils from 'react-addons-test-utils';
import { Provider as ReduxProvider } from 'react-redux';
import { createStore } from 'redux';
import { changeLocale, TranslateAction } from '../actions';
import TranslateProvider from '../Provider';
import reducer from '../reducer';
import { TranslatorOptions } from '../types';

const initial: TranslatorOptions = {
  messages: fromJS({
    cs: { home: { description: 'Foo', fallback: 'Fallback' } },
    en: { home: { description: 'enFoo', about: 'Bar' } },
  }),
  locale: 'cs',
  fallbackLocale: 'en',
};

const store = createStore(({}, action: TranslateAction) => ({ translate: reducer(initial, action) }));

describe('Translate Provider', () => {
  class Passthrough extends Component<{}, {}> {
    static contextTypes = {
      translator: PropTypes.object,
    };

    render() {
      return <div />;
    }
  }

  const container = TestUtils.renderIntoDocument(
    <ReduxProvider store={store} >
      <TranslateProvider>
        <Passthrough />
      </TranslateProvider>
    </ReduxProvider>,
  ) as  Component<{}, {}>;

  const stub = TestUtils.findRenderedComponentWithType(container, Passthrough);
  const translateCtx = stub.context.translator;

  it('should have a msg object in context', () => {
    expect(translateCtx.msg('description', { scope: 'home' })).toEqual('Foo');
  });

  it('should have a messages object in context', () => {
    expect(translateCtx.__messages().getIn(['cs', 'home', 'description'])).toEqual('Foo');
  });

  it('should change the selected locale', () => {
    store.dispatch(changeLocale('en'));
    expect(translateCtx.msg('description', {scope: 'home'})).toEqual('enFoo');
  });
});
