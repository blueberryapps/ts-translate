import { Map } from 'immutable';
import { Messages, TranslationResult } from './types';

export function __isSplittableKey(key: string): boolean {
  return key.includes('.') && !key.includes(' ') && key.lastIndexOf('.') !== key.length - 1;
}

export function createStructuredJSON(messages: Messages): Messages {
  let result: Messages = Map<string, Map<string, TranslationResult> | TranslationResult>();
  if (messages && typeof messages === 'object') { // we only want to incluence objects
      messages.forEach((value, key) => {
      if (key) {
        if (__isSplittableKey(key as string)) { // can we broke it into smaller objects?
          result = result.mergeDeep(__structureObject(key.split('.'), value) as Messages);
        } else { // if not, let's test the value - it may contain some splittable keys
          result = result.set(key, createStructuredJSON(value as Messages));
        }
      }
    });
  } else { // otherwise just set the value
    result = messages;
  }
  return result;
}

export function __structureObject(keys: string[], val: any) {
  let obj = {};
  if (keys.length !== 1) {
    const currentKey = keys.shift(); // let's take the head and start recursion
    if (currentKey) {
      obj[currentKey] = __structureObject(keys, val);
    }
  } else { // we already have the tail
    obj[keys[0]] = val; // so let's store the value
  }
  return obj;
}
