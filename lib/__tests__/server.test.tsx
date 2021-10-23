/**
 * @jest-environment node
 */
import * as React from 'react';
import ReactDOMServer from 'react-dom/server';
import {
  ViewportProvider,
  connectViewport,
  ObserveViewport,
} from '../index';
import {
  useViewport,
  useScroll,
  useDimensions,
  useLayoutSnapshot,
  useMutableViewport,
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
      useMutableViewport()
      return <div ref={ref} />;
    };
    return ReactDOMServer.renderToString(
      <ViewportProvider>
        <TestConnectViewport />
        <TestHooks />
        <ObserveViewport>{() => null}</ObserveViewport>
      </ViewportProvider>,
    );
  };

  it('should not throw', () => {
    expect(render).not.toThrow();
  });

  it('should render components as if they would have been disabled', () => {
    expect(render()).toBe('<div></div>');
  });
});
