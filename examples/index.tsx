import * as React from 'react';
import { render } from 'react-dom';

import {
  ViewportProvider,
  ObserveViewport,
  connectViewport,
  useScroll,
  useLayoutSnapshot,
  useDimensions,
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
  return (
    <div ref={div}>
      x: {x}, y: {y}, documentHeight: {documentHeight}, clientWidth:{' '}
      {clientWidth}, element offsetTop: {offsetTop}
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
              console.log('update scroll only', props.scroll);
            }}
          />
          <ObserveViewport
            onUpdate={({ dimensions, scroll }) => {
              if (this.lastDimensions !== dimensions) {
                console.log('update dimensions', dimensions);
                this.lastDimensions = dimensions;
              }
              if (this.lastScroll !== scroll) {
                console.log('update scroll', scroll);
                this.lastScroll = scroll;
              }
            }}
          />
          <ObserveViewport
            deferUpdateUntilIdle
            disableScrollUpdates
            onUpdate={props => {
              console.log('update dimensions lazy', props.dimensions);
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

render(
  <ViewportProvider experimentalSchedulerEnabled>
    <main role="main">
      <Example />
      <Placeholder />
      <Placeholder />
      <Placeholder />
    </main>
  </ViewportProvider>,
  document.getElementById('root'),
);
