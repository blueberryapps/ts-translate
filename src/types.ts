import { Map } from 'immutable';

export interface AppState {
  translate: TranslatorOptions;
}

export interface AppStore {
  getState: () => AppState;
}

export type TranslationResult = string | number | boolean | null | object;
export type Messages = Map<string, Map<string, TranslationResult>>;

export interface TranslatorOptions {
  locale: string;
  fallbackLocale?: string;
  messages?: Messages | any;
}

export interface MsgOptions {
  scope?: string;
}
