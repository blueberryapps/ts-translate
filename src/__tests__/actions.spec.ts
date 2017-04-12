import * as actions from '../actions';

it('changeLocale()', () => {
  expect(actions.changeLocale('es')).toEqual({
    type: 'TRANSLATE_CHANGE_LOCALE',
    payload: 'es',
  });
});
