import { fromJS } from 'immutable';
import * as actions from './actions';
import { Messages, TranslatorOptions } from './types';
import { TranslateAction } from './actions';

export const initialState: TranslatorOptions = {
  locale: 'en',
  fallbackLocale: 'en',
  messages: fromJS({}) as Messages
};

/**
 * Translation Redux reducer
 * @param  {Object} inputState  App state
 * @param  {Object} action      Flux action
 * @return {Object}             Updated app state
 */
export function translationReducer(state: TranslatorOptions = initialState, action: TranslateAction) {

  switch (action.type) {

    case actions.TRANSLATE_CHANGE_LOCALE: return { ...state, locale: action.value };
    default: return state;
  }

}

export default translationReducer;
