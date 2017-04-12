import { Map } from 'immutable';
import { Dispatch } from 'redux';
import { fetchTranslations, updateMessages } from './actions';
import apiCall, { apiUrlResolve } from './api';
import { ApiConfig, Locale, Messages, TranslationResult } from './types';

let changesEventSource: any = null;

export interface StoredTranslation {
  data_type: string;
  key: string;
  text: TranslationResult;
}
export type StoredTranslations = Map<string, Map<string, StoredTranslation>>;

export default class Connector {
  currentLocation: string;
  config: ApiConfig;
  api = apiCall;
  dispatch: Dispatch<void>;
  translationStore: any;
  previousTranslationsSend: any;
  sendTimeout: any;
  locale: Locale;

  constructor(config: ApiConfig, dispatch: Dispatch<void>, pathname?: string) {
    this.currentLocation = pathname || '/';
    this.config = config;
    this.dispatch = dispatch;

    this.__listenOnTranslationServer();

    this.translationStore = Map();
    this.previousTranslationsSend = this.translationStore;
    this.sendTimeout = null;
  }

  updateLocation(location: string) {
    this.currentLocation = location;
    this.__enqueeSendTranslations();
  }

  rememberUsedTranslation(locale: Locale, path: string | string[], message: TranslationResult | Messages) {
    this.locale = locale;

    if (!this.config.sync) {
      return;
    }

    if (this.__dataType(message) === 'array') {
      ((message || {}) as Messages).map((v: TranslationResult, k: string) => this.rememberUsedTranslation(locale, ([] as string[]).concat(path, [k]), v));
    } else {
      this.__rememberTranslation([locale].concat(path), message);
    }

    this.__enqueeSendTranslations();
  }

  sendTranslations() {
    if (!this.config.sync || !this.config.apiUrl || !this.config.apiToken) {
      return;
    }

    if (this.translationStore === this.previousTranslationsSend) {
      return;
    }

    this.translationStore.reduce(
      (output: Map<string, TranslationResult>, translations: StoredTranslations, location: string) => (
        output.set(
          location,
          translations.filter((_: any, key: string) => !this.previousTranslationsSend.getIn([location, key])),
        )
      ),
      Map(),
    )
    .filter((translations: StoredTranslations) => !translations.isEmpty())
    .map((translations: StoredTranslations, location: string) =>
      this.api(this.config, 'POST', 'api/v1/translations', {
        location,
        locale:       this.locale,
        translations: translations.toIndexedSeq().toJS(),
      }),
    );

    this.previousTranslationsSend = this.translationStore;
  }

  __enqueeSendTranslations() {
    if (!this.config.sync) {
      return;
    }

    if (this.sendTimeout) {
      clearTimeout(this.sendTimeout);
      this.sendTimeout = null;
    }

    this.sendTimeout = setTimeout(this.sendTranslations.bind(this), 1000);
  }

  __rememberTranslation(keyPath: string[], message: TranslationResult | Messages) {
    const path = keyPath.join('.');

    this.translationStore = this.translationStore.mergeIn(
      [this.currentLocation, path],
      {
        data_type: this.__dataType(message),
        key:       path,
        text:      message,
      },
    );
  }

  __listenOnTranslationServer() {
    const { apiUrl, apiToken, sync } = this.config;

    if (typeof window !== 'undefined' && !changesEventSource && sync) {
      fetchTranslations(this.config)(this.dispatch);

      if (this.config.liveSync) {
        const EventSource = require('eventsource');
        changesEventSource = new EventSource(apiUrlResolve(`${apiUrl}`, `api/v1/changes?token=${apiToken}`));
        changesEventSource.addEventListener('translations_changed', ({ data }: { data: string }) => {
          this.dispatch(updateMessages(JSON.parse(data)));
        });
      }
    }
  }

  __dataType(value: any) {
    if (!value && `${value}`.length === 0) {
      return null;
    }

    switch (typeof value) {
      case 'boolean': return 'bool';
      case 'object': return 'array';
      case 'string': return 'string';
      case 'number': return 'float';
      default: return null;
    }
  }
}
