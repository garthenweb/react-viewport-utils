import * as React from 'react';
import { render } from 'react-dom';

import {
  ViewportProvider,
  ObserveBoundingClientRect,
  connectViewport,
} from '../lib/index';
import StickyScrollUp from './StickyScrollUp';
import Sticky from './Sticky';
import StickyGroupProvider from './StickyGroup';

import './styles.css';

const Placeholder = () => <div className="placeholder" />;
const ViewportHeader = connectViewport()<{ a: string }>(({ dimensions, a }) => (
  <header className="header">
    Viewport: {dimensions.width}x{dimensions.height}
    {a}
  </header>
));

class Example extends React.PureComponent<{}, { disabled: boolean }> {
  private container1: React.RefObject<any>;
  private container2: React.RefObject<any>;

  constructor(props) {
    super(props);
    this.container1 = React.createRef();
    this.container2 = React.createRef();
    this.state = {
      disabled: false,
    };
  }

  renderButton() {
    return (
      <button onClick={() => this.setState({ disabled: !this.state.disabled })}>
        Toggle active
      </button>
    );
  }

  render() {
    if (this.state.disabled) {
      return this.renderButton();
    }
    return (
      <StickyGroupProvider>
        <StickyScrollUp>
          <ViewportHeader a="test" />
        </StickyScrollUp>
        <Placeholder />

        <div ref={this.container1}>
          <Sticky container={this.container1}>
            <div className="sticky-inline">Sticky inline1</div>
          </Sticky>
          <Placeholder />
        </div>

        <Sticky>
          <div className="sticky-inline">Sticky inline2</div>
        </Sticky>

        <div className="placeholder" ref={this.container2} />
        <ObserveBoundingClientRect
          node={this.container2}
          onInit={rect => console.log('init', rect)}
          onUpdate={rect => console.log('update', rect)}
        />
        <Placeholder />
        <Placeholder />
        {this.renderButton()}
      </StickyGroupProvider>
    );
  }
}

render(
  <ViewportProvider>
    <main role="main">
      <Example />
      <Placeholder />
      <Placeholder />
      <Placeholder />
    </main>
  </ViewportProvider>,
  document.getElementById('root'),
);
