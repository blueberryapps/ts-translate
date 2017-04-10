import * as React from 'react';
import { TranslationResult } from './types';

export interface CntProps {
  content: TranslationResult;
  usedKey: string;
}

export default function createCnt(key: string, result: TranslationResult): JSX.Element {
  class Cnt extends React.Component<CntProps, void> {
    render() {
      const { content, usedKey } = this.props;

      if (!content) {
        return null;
      }

      return (
        <span className={`cnt cnt.${usedKey}`} dangerouslySetInnerHTML={{ __html: `${content}` }} />
      );
    }
  }

  const cntInstace = <Cnt key={key} content={result} usedKey={key} />;

  return {
    ...cntInstace,
    toString: () => result
  };
}
