import { Action } from 'redux';

export interface TranslateAction extends Action {
  value: string;
}

export const TRANSLATE_CHANGE_LOCALE = 'TRANSLATE_CHANGE_LOCALE';

export function changeLocale(locale: string): TranslateAction {
  return {
    type: TRANSLATE_CHANGE_LOCALE,
    value: locale
  };
}
