import * as React from 'react';
import BoundingClientRect from '../lib/BoundingClientRect';
import { connect as connectStickyGroup } from './StickyGroup';

interface IProps {
  children?: React.ReactNode;
  stickyOffset: number;
}

const isSticky = (rect, offsetTop) => {
  return rect.top <= offsetTop;
};

const calcPositionStyles = (rect, offsetTop): React.CSSProperties => {
  if (isSticky(rect, offsetTop)) {
    return {
      position: 'fixed',
      top: 0,
    };
  }

  return {
    position: 'absolute',
    top: 0,
  };
};

class Sticky extends React.PureComponent<IProps> {
  private stickyRef: React.RefObject<any>;
  constructor(props) {
    super(props);
    this.stickyRef = React.createRef();
  }

  render() {
    const { children, stickyOffset } = this.props;
    const baseStyles: React.CSSProperties = {
      willChange: 'position, top',
      position: 'static',
      top: 'auto',
      width: '100%',
    };
    return (
      <div ref={this.stickyRef} style={{ position: 'relative' }}>
        <BoundingClientRect node={this.stickyRef}>
          {rect => {
            const offsetY = isSticky(rect, stickyOffset) ? stickyOffset : 0;
            const styles = {
              transform: `translateZ(0) translateY(${offsetY}px)`,
              ...baseStyles,
              ...calcPositionStyles(rect, stickyOffset),
            };
            return <div style={styles}>{children}</div>;
          }}
        </BoundingClientRect>
      </div>
    );
  }
}

export default connectStickyGroup()(Sticky);
