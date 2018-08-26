import * as React from 'react';
import BoundingClientRect from '../lib/BoundingClientRect';

const calcPositionStyles = (rect): React.CSSProperties => {
  if (rect.top <= 0) {
    return {
      position: 'fixed',
      top: 0,
    }
  }

  return {
    position: 'absolute',
    top: 0
  };
};

class Sticky extends React.PureComponent {
  private stickyRef: React.RefObject<any>
  constructor(props) {
    super(props);
    this.stickyRef = React.createRef();
  }

  render() {
    const { children } = this.props;
    const baseStyles: React.CSSProperties = {
      transform: 'translateZ(0)',
      willChange: 'position, top',
      position: 'static',
      top: 'auto',
      width: '100%',
    };
    return (
      <div ref={this.stickyRef} style={{ position: 'relative' }}>
        <BoundingClientRect node={this.stickyRef}>
          {rect => {
            const styles = {
              ...baseStyles,
              ...calcPositionStyles(rect),
            };
            return (
              <div style={styles}>
                {children}
              </div>
            );
          }}
        </BoundingClientRect>
      </div>
    );
  }
}

export default Sticky;
