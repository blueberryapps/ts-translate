import { Map } from 'immutable';
import reducer, { initialState } from '../reducer';

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
});
