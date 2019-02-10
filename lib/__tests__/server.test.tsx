/**
 * @jest-environment node
 */
import * as React from 'react';
import ReactDOMServer from 'react-dom/server';
import {
  ViewportProvider,
  connectViewport,
  ObserveBoundingClientRect,
  ObserveViewport,
} from '../index';
import {
  useViewport,
  useScroll,
  useDimensions,
  useLayoutSnapshot,
} from '../hooks';

describe('server side rendering', () => {
  const render = () => {
    const TestConnectViewport = connectViewport()(() => null);
    const TestHooks = () => {
      const ref = React.useRef(null);
      useScroll();
      useDimensions();
      useViewport();
      useLayoutSnapshot(() => null);
      return <div ref={ref} />;
    };
    const ref = React.createRef<any>();
    return ReactDOMServer.renderToString(
      <ViewportProvider>
        <TestConnectViewport />
        <TestHooks />
        <ObserveBoundingClientRect node={ref}>
          {() => <div ref={ref} />}
        </ObserveBoundingClientRect>
        <ObserveViewport>{() => null}</ObserveViewport>
      </ViewportProvider>,
    );
  };

  it('should not throw', () => {
    expect(render).not.toThrow();
  });

  it('should render components as if they would have been disabled', () => {
    expect(render()).toBe('<div></div><div></div>');
  });
});
