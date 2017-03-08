export interface AppState {
  translate: TranslatorOptions;
}

export interface AppStore {
  getState: () => AppState;
}

export type Messages = Map<string, Map<string, string>>;
export type TranslationResult = string | number | boolean | null | object;

export interface TranslatorOptions {
  locale: string;
  fallbackLocale?: string;
  messages?: Messages;
}

export interface MsgOptions {
  scope?: string;
}
