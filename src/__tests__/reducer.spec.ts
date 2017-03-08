import reducer, { initialState } from '../reducer';

describe('translate reducer', () => {
  it('it should return initial state', () => {
    expect(reducer(undefined, {type: 'INIT', value: ''})).toEqual(initialState);
  });

  it('should change locale', () => {
    const action = {
      type: 'TRANSLATE_CHANGE_LOCALE',
      value: 'es'
    };

    expect(reducer(undefined, action).locale).toEqual('es');
  });
});
