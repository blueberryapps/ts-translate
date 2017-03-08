import * as React from 'react';

interface CntProps {
  content: string;
}

export default class Cnt extends React.Component<CntProps, void> {
  render() {
    const { content } = this.props;

    return (
      <span className="cnt" dangerouslySetInnerHTML={{ __html: content }} />
    );
  }
}
