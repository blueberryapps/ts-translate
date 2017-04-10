import * as React from 'react';
import { TranslationResult } from './types';

export interface CntProps {
  content: TranslationResult;
}

export default class Cnt extends React.Component<CntProps, void> {
  render() {
    const { content } = this.props;

    if (!content) {
      return null;
    }

    return (
      <span className="cnt" dangerouslySetInnerHTML={{ __html: `${content}` }} />
    );
  }
}
