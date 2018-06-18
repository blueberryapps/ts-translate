import { Map } from 'immutable';
import * as React from 'react';
import { classifyKey } from './classifyKey';
import { MsgClickHanlder } from './translator';
import { TranslationResult } from './types';

export interface CntProps {
  content: TranslationResult;
  usedKey: string;
}

type CreateCnt = (key: string, result: TranslationResult, onClick?: MsgClickHanlder) => JSX.Element;

export const createCnt: CreateCnt = (key, result, onClick) => {
  class Cnt extends React.Component<CntProps, {}> {

    onClick = (): void => {
      if (onClick) {
        onClick(key, this);
      }
    }

    render() {
      const { content, usedKey } = this.props;

      if (!content) {
        return null;
      }

      return (
        <span
          data-key={key}
          onClick={this.onClick}
          className={`cnt ${classifyKey(usedKey)}`}
          dangerouslySetInnerHTML={{ __html: `${content}` }}
        />
      );
    }
  }

  const cntInstace = (
    <Cnt
      key={key}
      content={result}
      usedKey={key}
    />
  );

  return {
    ...cntInstace,
    toString: () => result,
  } as JSX.Element;
};

export const memoizeCreateCnt = (fn: CreateCnt) => {
  let memoizeCache = Map<string, Map<TranslationResult, JSX.Element>>();
  return (key: string, result: TranslationResult, onClick?: MsgClickHanlder): JSX.Element => {
    if (memoizeCache.hasIn([key, result])) {
      return memoizeCache.getIn([key, result]);
    }

    const newResult = fn(key, result, onClick);
    memoizeCache = memoizeCache.setIn([key, result], newResult);
    return newResult;
  };
};

export default memoizeCreateCnt(createCnt);
