import { fromJS, Map } from 'immutable';
import reducer, { initialState } from '../reducer';

const initial = { ...initialState, messages: fromJS({ cs: { home: { description: 'Foo' } } }) };

describe('translate reducer', () => {
  it('it should return initial state', () => {
    expect(reducer(undefined, {type: 'INIT', payload: ''})).toEqual(initialState);
  });

  it('it should revive state', () => {
    const state = reducer({ messages: { en: { foo: 'bar' }}, locale: 'en'}, {type: 'INIT', payload: ''});
    expect(Map.isMap(state.messages)).toEqual(true);
    expect(state.messages.getIn(['en', 'foo'])).toEqual('bar');
  });

  it('should change locale', () => {
    const action = {
      type: 'TRANSLATE_CHANGE_LOCALE',
      payload: 'es',
    };

    expect(reducer(undefined, action).locale).toEqual('es');
  });

  it('should update messages', () => {
    const messages = fromJS({
      cs: { home: { title: 'Bar' } },
      en: { home: { title: 'home', desciption: 'description' } },
    });

    const action = {
      type: 'TRANSLATE_UPDATE_MESSAGES',
      payload: messages,
    };

    expect(reducer(undefined, action).messages.toJS()).toEqual(messages.toJS());
    expect(reducer(initial, action).messages.getIn(['cs', 'home', 'description'])).toEqual('Foo');
    expect(reducer(initial, action).messages.getIn(['cs', 'home', 'title'])).toEqual('Bar');
  });

});
