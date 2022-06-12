import React from 'react';
import { createRoot } from 'react-dom/client';

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
  useMutableViewport,
} from '../lib/index';

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
  const rect = useRect(div);
  return (
    <div ref={div}>
      x: {x}, y: {y}
      <br />
      documentHeight: {documentHeight}
      <br />
      clientWidth: {clientWidth}
      <br />
      rect.top: {rect ? rect.top : 'null'}, rect.bottom:{' '}
      {rect ? rect.bottom : 'null'}
    </div>
  );
});

const LayoutSnapshot = () => {
  const div = React.useRef(null);
  const offsetTop = useLayoutSnapshot<number>(({ scroll }) => {
    if (!div.current) {
      return 0;
    }
    return div.current.getBoundingClientRect().top + scroll.y;
  });
  console.log('hook:layout snapshot', offsetTop);
  return <div ref={div} />;
};

const LayoutOutside = React.memo(() => {
  const [active, setActive] = React.useState(true);
  return (
    <>
      <button onClick={() => setActive(!active)}>change active</button>
      {active && <LayoutSnapshot />}
    </>
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
        <ViewportHeader a="Some header text" />
        <ObserveViewport
          disableDimensionsUpdates
          onUpdate={(props) => {
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
          onUpdate={(props) => {
            console.log(
              'ObserveViewport: update dimensions lazy',
              props.dimensions,
            );
          }}
        />
        <Placeholder />
        <Placeholder />
        {this.renderButton()}
      </ViewportProvider>
    );
  }
}

const HooksExample = () => {
  const ref = React.useRef<HTMLDivElement>();
  useScrollEffect((scroll) => console.log('hook:scroll effect', scroll));
  useDimensionsEffect((dimensions) =>
    console.log('hook:dimensions effect', dimensions),
  );
  useViewportEffect((viewport) =>
    console.log('hook:viewport effect', viewport),
  );
  useRectEffect((rect) => console.log('hook:rect effect', rect), ref);
  const viewport = useMutableViewport();

  React.useEffect(() => {
    const id = setInterval(() => {
      console.log('hook:mutableViewport', {
        scroll: viewport.scroll,
        dimensions: viewport.dimensions,
      });
    }, 1000);
    return () => clearInterval(id);
  }, [viewport]);
  return <div ref={ref} />;
};

const root = createRoot(document.getElementById('root'));

root.render(
  <ViewportProvider
    experimentalSchedulerEnabled
    experimentalSchedulerLayoutCalculatorEnabled
  >
    <main role="main">
      <Example />
      <HooksExample />
      <Placeholder />
      <Placeholder />
      <Placeholder />
      <LayoutOutside />
    </main>
  </ViewportProvider>,
);

setInterval(() => {
  root.render(
    <ViewportProvider
      experimentalSchedulerEnabled
      experimentalSchedulerLayoutCalculatorEnabled
    >
      <main role="main">
        <Example />
        <HooksExample />
        <Placeholder />
        <Placeholder />
        <Placeholder />
        <LayoutOutside />
      </main>
    </ViewportProvider>,
  );
}, 1000);
