import * as React from 'react';
import { render } from 'react-dom';

import { ViewportProvider, ObserveBoundingClientRect } from '../lib/index';
import StickyScrollUp from './StickyScrollUp';
import Sticky from './Sticky';
import StickyGroupProvider from './StickyGroup';

import './styles.css';

const Placeholder = () => <div className="placeholder" />;

class Example extends React.PureComponent {
  private container1: React.RefObject<any>;
  private container2: React.RefObject<any>;

  constructor(props) {
    super(props);
    this.container1 = React.createRef();
    this.container2 = React.createRef();
  }

  render() {
    return (
      <StickyGroupProvider>
        <StickyScrollUp>
          <div className="header">Header</div>
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
          onInit={(rect) => console.log('init', rect)}
          onUpdate={(rect) => console.log('update', rect)}
        />
        <Placeholder />
        <Placeholder />
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
