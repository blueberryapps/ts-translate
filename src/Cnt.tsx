import * as React from 'react';
import { TranslationResult } from './types';

interface CntProps {
  content: TranslationResult;
}

export default class Cnt extends React.Component<CntProps, void> {
  render() {
    const { content } = this.props;

    return (
      <span className="cnt" dangerouslySetInnerHTML={{ __html: `${content}` }} />
    );
  }
}
