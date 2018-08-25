import * as React from 'react';
import { render } from 'react-dom';

import Provider, { connectScroll } from '../lib/index';

import './styles.css';

const HEADER_HEIGHT = 300;
class Header extends React.Component<{ scroll: any }> {
  private node: HTMLElement | null;

  get currentBoundingClientTop() {
    if (!this.node) {
      return 0;
    }
    return this.node.getBoundingClientRect().top;
  }

  get currentNodeTop() {
    return this.props.scroll.y + this.currentBoundingClientTop;
  }

  getStyles() {
    if (!this.node) {
      return {};
    }

    if (this.props.scroll.isScrollingDown) {
      return {
        position: 'absolute',
        top: this.currentNodeTop,
      };
    }

    const isTopVisible = this.currentBoundingClientTop >= 0;
    const isBottomVisible = this.currentBoundingClientTop + HEADER_HEIGHT <= 0;
    if (!isTopVisible && !isBottomVisible) {
      return {
        position: 'absolute',
        top: this.currentNodeTop,
      };
    }

    if (this.props.scroll.yDTurn === 0) {
      return {
        position: 'absolute',
        top: this.props.scroll.yTurn - HEADER_HEIGHT,
      };
    }

    return {
      position: 'fixed',
      top: 0,
    };
  }

  registerNode = el => {
    this.node = el;
  };

  render() {
    const styles = {
      transform: 'translateZ(0)',
      willChange: 'position, top',
      ...this.getStyles(),
    };

    return (
      <div className="header" ref={this.registerNode} style={styles}>
        Header
      </div>
    );
  }
}

const ConnectedHeader = connectScroll()(Header);

const StickyInline = connectScroll()(() => {
  return <div className="sticky-inline">Sticky inline</div>;
});

const Placeholder = () => <div className="placeholder" />;

render(
  <main role="main">
    <Provider>
      <ConnectedHeader />
      <Placeholder />
      <StickyInline />
      <Placeholder />
      <StickyInline />
      <Placeholder />
      <Placeholder />
      <Placeholder />
    </Provider>
    <Placeholder />
    <Placeholder />
    <Placeholder />
  </main>,
  document.getElementById('root'),
);
