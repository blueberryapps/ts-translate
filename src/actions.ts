import { Action, Dispatch } from 'redux';
import api from './api';
import { ApiConfig, Messages } from './types';

export interface TranslateAction extends Action {
  payload: string | Messages;
}

export const TRANSLATE_CHANGE_LOCALE = 'TRANSLATE_CHANGE_LOCALE';
export const TRANSLATE_UPDATE_MESSAGES = 'TRANSLATE_UPDATE_MESSAGES';
/**
 * Action for changing locale to display
 * @param {String}  locale name of locale
 * @return {Object}        declared action
 */
export function changeLocale(locale: string): TranslateAction {
  return {
    type: TRANSLATE_CHANGE_LOCALE,
    payload: locale,
  };
}

/**
 * Action for updating locale messages
 * @param {Object}  messages format options
 * @return {Object}          declared action
 */
export function updateMessages(messages: Messages): TranslateAction {
  return {
    type: TRANSLATE_UPDATE_MESSAGES,
    payload: messages,
  };
}

/**
 * Action for updating locale messages
 * @param {Object}  config configuration options
 * @return {Object}        declared action
 */
export function fetchTranslations(config: ApiConfig) {  
  return (dispatch: Dispatch<void>) => {
    dispatch({ type: 'TRANSLATE_FETCH_START' });
    const getPromise = async () => {
      try {
        const apiEndpoint = config.apiEndpoint || 'api/v1/translations';
        const data = await api(config, 'GET', apiEndpoint);
        dispatch(updateMessages(data));
        dispatch({ type: 'TRANSLATE_FETCH_SUCCESS' });
        return data;
      } catch (error) {
        dispatch({ type: 'TRANSLATE_FETCH_ERROR', payload: error });
      }
    };

    return getPromise();
  };
}
