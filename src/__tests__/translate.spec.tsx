/* tslint:disable max-classes-per-file */

import { fromJS  } from 'immutable';
import * as React from 'react';
import * as TestUtils from 'react-dom/test-utils';
import { Provider as ReduxProvider } from 'react-redux';
import { Action, combineReducers, createStore } from 'redux';
import { changeLocale, updateMessages } from '../actions';
import TranslateProvider from '../Provider';
import reducer from '../reducer';
import { translate, TranslateProps } from '../translate';
import { TranslatorOptions } from '../types';

const initial: TranslatorOptions = {
  messages: fromJS({
    cs: { home: { description: 'Foo', fallback: 'Fallback' } },
    en: { home: { header: { title: 'FooBar' }, description: 'enFoo', about: 'Bar' } },
  }),
  locale: 'cs',
  fallbackLocale: 'en',
};

interface State {
  translate: TranslatorOptions;
  counter: number;
}
const counter = (state = 0, action: Action) => action.type === 'INC' ? state + 1 : state;
const store = createStore<State>(combineReducers<State>({ translate: reducer, counter }), { translate: initial, counter: 2 });

describe('Translate Decorator', () => {
  class Passthrough extends React.Component<any, {}> {
    render() {
      return <div />;
    }
  }

  class Container extends React.Component<TranslateProps, {}> {
    render() {
      return (
        <Passthrough {...this.props} />
      );
    }
  }

  const createStub = (scope?: string | string[], options = {}) => {
    const DecoratedContainer = translate<{}>(scope, options)(Container);

    const container = TestUtils.renderIntoDocument(
      <ReduxProvider store={store}>
        <TranslateProvider >
          <DecoratedContainer />
        </TranslateProvider>
      </ReduxProvider>,
    ) as  React.Component<{}, {}>;

    return TestUtils.findRenderedComponentWithType(container, Passthrough);
  };

  it('should have a msg prop', () => {
    expect(createStub().props.msg('description', { scope: 'home' }).toString()).toEqual('Foo');
  });

  it('should have default message', () => {
    expect(createStub().props.msg('Default Message', { scope: 'home' }).toString()).toEqual('Default Message');
  });

  it('should have a hasMsg prop', () => {
    expect(createStub().props.hasMsg('description', { scope: 'home' })).toEqual(true);
  });

  it('should have a hasMsg message and return false for default text', () => {
    expect(createStub().props.hasMsg('Default Message', { scope: 'home' })).toEqual(false);
  });

  it('should return undefined when disableDefault', () => {
    expect(createStub('', { disableDefault: true }).props.msg('Default Message', { scope: 'home' }).toString()).toEqual(undefined);
  });

  it('should have a msg prop with scope', () => {
    expect(createStub('home').props.msg('description').toString()).toEqual('Foo');
  });

  it('should have a msg prop with array scope', () => {
    expect(createStub(['home', 'header']).props.msg('title').toString()).toEqual('FooBar');
  });

  it('should have a msg prop with dotted scope', () => {
    expect(createStub('home.header').props.msg('title').toString()).toEqual('FooBar');
  });

  describe('shouldComponentUpdate', () => {
    const DecoratedContainer = translate<{}>()(Passthrough as any);
    const getSpy = () => {
      const container = TestUtils.renderIntoDocument(
        <ReduxProvider store={store}>
          <TranslateProvider >
            <DecoratedContainer />
          </TranslateProvider>
        </ReduxProvider>,
      ) as  React.Component<{}, {}>;

      const instance = TestUtils.findRenderedComponentWithType(container, DecoratedContainer as React.ClassType<any, any, any>);
      const spy = jest.fn(instance.render);
      instance.render = spy;
      return spy;
    };

    it('should rerender on locale change', () => {
      const spy = getSpy();
      store.dispatch(changeLocale('en'));
      store.dispatch(changeLocale('en'));
      store.dispatch(changeLocale('cs'));
      store.dispatch(changeLocale('cs'));
      store.dispatch(changeLocale('en'));
      store.dispatch(changeLocale('en'));

      expect(spy.mock.calls.length).toEqual(3);
    });

    it('should rerender on message change', () => {
      const spy = getSpy();
      store.dispatch(updateMessages(fromJS({ en: { foo: 'bar' } })));
      store.dispatch(updateMessages(fromJS({ en: { foo: 'bar' } })));
      store.dispatch(updateMessages(fromJS({ en: { foo: 'bar2' } })));
      store.dispatch(updateMessages(fromJS({ en: { foo: 'bar2' } })));

      expect(spy.mock.calls.length).toEqual(2);
      store.dispatch({ type: 'INC' });
      store.dispatch({ type: 'INC' });
      store.dispatch({ type: 'INC' });
      expect(spy.mock.calls.length).toEqual(2);
    });
  });
});
