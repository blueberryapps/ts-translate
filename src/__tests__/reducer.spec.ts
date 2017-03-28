import { Map, fromJS } from 'immutable';
import reducer, { initialState } from '../reducer';

const initial = { ...initialState, messages: fromJS({ cs: { home: { description: 'Foo' } } }) };

describe('translate reducer', () => {
  it('it should return initial state', () => {
    expect(reducer(undefined, {type: 'INIT', value: ''})).toEqual(initialState);
  });

  it('it should revive state', () => {
    const state = reducer({ messages: { en: { foo: 'bar' }}, locale: 'en'}, {type: 'INIT', value: ''});
    expect(Map.isMap(state.messages)).toEqual(true);
    expect(state.messages.getIn(['en', 'foo'])).toEqual('bar');
  });

  it('should change locale', () => {
    const action = {
      type: 'TRANSLATE_CHANGE_LOCALE',
      value: 'es'
    };

    expect(reducer(undefined, action).locale).toEqual('es');
  });

  it('should update messages', () => {
    const messages = fromJS({
      cs: { home: { title: 'Bar' } },
      en: { home: { title: 'home', desciption: 'description' } }
    });

    const action = {
      type: 'TRANSLATE_UPDATE_MESSAGES',
      value: messages
    };

    expect(reducer(undefined, action).messages.toJS()).toEqual(messages.toJS());
    expect(reducer(initial, action).messages.getIn(['cs', 'home', 'description'])).toEqual('Foo');
    expect(reducer(initial, action).messages.getIn(['cs', 'home', 'title'])).toEqual('Bar');
  });

});
