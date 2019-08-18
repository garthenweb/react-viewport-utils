import * as React from 'react';
import { render } from 'react-dom';

import {
  ViewportProvider,
  ObserveViewport,
  connectViewport,
  useScroll,
  useLayoutSnapshot,
  useDimensions,
  useRect,
  useScrollEffect,
  useDimensionsEffect,
  useViewportEffect,
  useRectEffect,
} from '../lib/index';
import StickyScrollUp from './StickyScrollUp';
import Sticky from './Sticky';
import StickyGroupProvider from './StickyGroup';

import './styles.css';

const Placeholder = () => <div className="placeholder" />;
const ViewportHeader = connectViewport({ omit: ['scroll'] })<{ a: string }>(
  ({ dimensions, a }) => (
    <header className="header">
      Viewport: {dimensions.width}x{dimensions.height}
      {a}
      <DisplayViewport />
    </header>
  ),
);

const DisplayViewport = React.memo(() => {
  const div = React.useRef(null);
  const { x, y } = useScroll({
    priority: 'low',
  });
  const { documentHeight, clientWidth } = useDimensions({
    priority: 'low',
  });
  const offsetTop = useLayoutSnapshot<number>(({ scroll }) => {
    if (!div.current) {
      return 0;
    }
    return div.current.getBoundingClientRect().top + scroll.y;
  });
  const rect = useRect(div);
  return (
    <div ref={div}>
      x: {x}, y: {y}
      <br />
      documentHeight: {documentHeight}
      <br />
      clientWidth: {clientWidth}, element offsetTop: {offsetTop}
      <br />
      rect.top: {rect ? rect.top : 'null'}, rect.bottom:{' '}
      {rect ? rect.bottom : 'null'}
    </div>
  );
});

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

  lastDimensions = null;
  lastScroll = null;

  render() {
    if (this.state.disabled) {
      return this.renderButton();
    }
    return (
      <ViewportProvider>
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
          <ObserveViewport
            disableDimensionsUpdates
            onUpdate={props => {
              console.log('ObserveViewport: update scroll only', props.scroll);
            }}
          />
          <ObserveViewport
            onUpdate={({ dimensions, scroll }) => {
              if (this.lastDimensions !== dimensions) {
                console.log('ObserveViewport: update dimensions', dimensions);
                this.lastDimensions = dimensions;
              }
              if (this.lastScroll !== scroll) {
                console.log('ObserveViewport: update scroll', scroll);
                this.lastScroll = scroll;
              }
            }}
          />
          <ObserveViewport
            deferUpdateUntilIdle
            disableScrollUpdates
            onUpdate={props => {
              console.log(
                'ObserveViewport: update dimensions lazy',
                props.dimensions,
              );
            }}
          />
          <Placeholder />
          <Placeholder />
          {this.renderButton()}
        </StickyGroupProvider>
      </ViewportProvider>
    );
  }
}

const HooksExample = () => {
  const ref = React.useRef<HTMLDivElement>();
  useScrollEffect(scroll => console.log('hook:scroll effect', scroll));
  useDimensionsEffect(dimensions =>
    console.log('hook:dimensions effect', dimensions),
  );
  useViewportEffect(viewport => console.log('hook:viewport effect', viewport));
  useRectEffect(rect => console.log('hook:rect effect', rect), ref);
  return <div ref={ref} />;
};

render(
  <ViewportProvider experimentalSchedulerEnabled>
    <main role="main">
      <Example />
      <HooksExample />
      <Placeholder />
      <Placeholder />
      <Placeholder />
    </main>
  </ViewportProvider>,
  document.getElementById('root'),
);

setInterval(() => {
  render(
    <ViewportProvider experimentalSchedulerEnabled>
      <main role="main">
        <Example />
        <HooksExample />
        <Placeholder />
        <Placeholder />
        <Placeholder />
      </main>
    </ViewportProvider>,
    document.getElementById('root'),
  );
}, 1000);
