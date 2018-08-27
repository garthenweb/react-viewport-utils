import * as React from 'react';
import { ObserveBoundingClientRect, connectViewportScroll } from '../lib/index';
import { connect as connectStickyGroup } from './StickyGroup';

interface IProps {
  scroll: {
    y: number;
    yTurn: number;
    yDTurn: number;
    isScrollingDown: boolean;
    isScrollingUp: boolean;
  };
  updateStickyOffset?: (offset: number) => void;
}

const calcPositionStyles = (rect, scroll): React.CSSProperties => {
  if (scroll.isScrollingDown) {
    return {
      position: 'absolute',
      top: scroll.y + rect.top,
    };
  }

  const isTopVisible = rect.top >= 0;
  const isBottomVisible = rect.top + rect.height <= 0;
  if (!isTopVisible && !isBottomVisible) {
    return {
      position: 'absolute',
      top: scroll.y + rect.top,
    };
  }

  if (scroll.y === 0) {
    return {
      position: 'absolute',
      top: 0,
    };
  }

  if (scroll.yDTurn === 0) {
    return {
      position: 'absolute',
      top: scroll.yTurn - rect.height,
    };
  }

  return {
    position: 'fixed',
    top: 0,
  };
};

const baseStyles: React.CSSProperties = {
  transform: 'translateZ(0)',
  willChange: 'position, top',
  position: 'static',
  top: 'auto',
  width: '100%',
  zIndex: 1,
};

class StickyScrollUp extends React.PureComponent<IProps> {
  private stickyRef: React.RefObject<any>;
  constructor(props) {
    super(props);
    this.stickyRef = React.createRef();
  }

  componentDidUpdate() {
    if (this.props.updateStickyOffset) {
      const { bottom } = this.stickyRef.current.getBoundingClientRect();
      const offset = Math.max(bottom, 0);
      this.props.updateStickyOffset(offset);
    }
  }

  render() {
    const { scroll, children } = this.props;
    return (
      <ObserveBoundingClientRect node={this.stickyRef}>
        {rect => {
          const styles = rect
            ? {
                ...baseStyles,
                ...calcPositionStyles(rect, scroll),
              }
            : null;
          return (
            <div ref={this.stickyRef} style={styles}>
              {children}
            </div>
          );
        }}
      </ObserveBoundingClientRect>
    );
  }
}

export default connectStickyGroup()(connectViewportScroll()(StickyScrollUp));
