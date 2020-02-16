import { IRect, IScroll, IDimensions, OnUpdateType } from './types';

export const shallowEqualScroll = (a: IScroll, b: IScroll) => {
  if (a === b) {
    return true;
  }
  return (
    a.x === b.x &&
    a.y === b.y &&
    a.xTurn === b.xTurn &&
    a.yTurn === b.yTurn &&
    a.xDTurn === b.xDTurn &&
    a.yDTurn === b.yDTurn &&
    a.isScrollingUp === b.isScrollingUp &&
    a.isScrollingDown === b.isScrollingDown &&
    a.isScrollingLeft === b.isScrollingLeft &&
    a.isScrollingRight === b.isScrollingRight
  );
};

export const shallowEqualRect = (a: IRect, b: IRect) => {
  if (a === b) {
    return true;
  }

  return (
    a.top === b.top &&
    a.right === b.right &&
    a.bottom === b.bottom &&
    a.left === b.left &&
    a.height === b.height &&
    a.width === b.width
  );
};

export const shallowEqualDimensions = (a: IDimensions, b: IDimensions) => {
  if (a === b) {
    return true;
  }

  return (
    a.width === b.width &&
    a.height === b.height &&
    a.clientWidth === b.clientWidth &&
    a.clientHeight === b.clientHeight &&
    a.outerWidth === b.outerWidth &&
    a.outerHeight === b.outerHeight &&
    a.documentWidth === b.documentWidth &&
    a.documentHeight === b.documentHeight
  );
};

// implementation based on https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
export const browserSupportsPassiveEvents = (() => {
  if (typeof window === 'undefined') {
    return false;
  }
  let supportsPassive = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: () => {
        supportsPassive = true;
      },
    });
    window.addEventListener('testPassive', null as any, opts);
    window.removeEventListener('testPassive', null as any, opts);
  } catch (e) {
    return false;
  }
  return supportsPassive;
})();

export const simpleDebounce = <F extends (...args: any[]) => any>(
  fn: F,
  delay: number,
): F => {
  let timeout: NodeJS.Timer;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay, ...args);
  }) as F;
};

export const debounceOnUpdate = (
  fn: OnUpdateType,
  delay: number,
): OnUpdateType => {
  let timeout: NodeJS.Timer;
  let scrollDidUpdate = false;
  let dimensionsDidUpdate = false;

  return (viewport, options) => {
    clearTimeout(timeout);
    scrollDidUpdate = scrollDidUpdate || options.scrollDidUpdate;
    dimensionsDidUpdate = dimensionsDidUpdate || options.dimensionsDidUpdate;
    timeout = setTimeout(() => {
      fn(viewport, {
        scrollDidUpdate,
        dimensionsDidUpdate,
      });
      scrollDidUpdate = false;
      dimensionsDidUpdate = false;
    }, delay);
  };
};

export const warnNoContextAvailable = (location: string) => {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  const fromHook = location.startsWith('use');
  if (fromHook) {
    console.warn(
      `react-viewport-utils: ${location} hook is not able to connect to a <ViewportProvider>. Therefore it cannot detect updates from the viewport and will not work as expected. To resolve this issue please add a <ViewportProvider> as a parent of the component using the hook, e.g. directly in the ReactDOM.render call:

import * as ReactDOM from 'react-dom';
import { ViewportProvider, ${location} } from 'react-viewport-utils';

const MyComponent = () => {
  ${location}()
  ...
}

ReactDOM.render(
  <ViewportProvider>
    <main role="main">
      <MyComponent />
    </main>
  </ViewportProvider>,
  document.getElementById('root')
);`,
    );
    return;
  }
  console.warn(
    `react-viewport-utils: ${location} component is not able to connect to a <ViewportProvider>. Therefore it cannot detect updates from the viewport and will not work as expected. To resolve this issue please add a <ViewportProvider> as a parent of the <ObserveViewport> component, e.g. directly in the ReactDOM.render call:

import * as ReactDOM from 'react-dom';
import { ViewportProvider, ObserveViewport } from 'react-viewport-utils';
ReactDOM.render(
  <ViewportProvider>
    <main role="main">
      <ObserveViewport>
        {({ scroll, dimensions }) => ...}
      </ObserveViewport>
    </main>
  </ViewportProvider>,
  document.getElementById('root')
);`,
  );
};

export const warnNoResizeObserver = () => {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  console.warn(
    'react-viewport-utils: This browser does not support the ResizeObserver API, therefore not all possible resize events will be detected. In most of the cases this is not an issue and can be ignored. If its relevant to your application please consider adding a polyfill, e.g. https://www.npmjs.com/package/resize-observer-polyfill .',
  );
};

type RequestAnimationFrameType = (callback: FrameRequestCallback) => number;

export const requestAnimationFrame = ((): RequestAnimationFrameType => {
  if (typeof window !== 'undefined') {
    const nativeRAF =
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      (<any>window).mozRequestAnimationFrame;
    if (nativeRAF) {
      return nativeRAF.bind(window);
    }
  }
  return function requestAnimationFrameFallback(
    callback: FrameRequestCallback,
  ): number {
    return (setTimeout(callback, 1000 / 60) as unknown) as number;
  };
})();

export const cancelAnimationFrame = ((): ((handle: number) => void) => {
  if (typeof window !== 'undefined') {
    const nativeCAF =
      window.cancelAnimationFrame ||
      window.webkitCancelAnimationFrame ||
      (<any>window).webkitCancelRequestAnimationFrame;
    if (nativeCAF) {
      return nativeCAF.bind(window);
    }
  }
  return clearTimeout;
})();

export const now =
  typeof performance !== 'undefined' && performance.now
    ? performance.now.bind(performance)
    : Date.now.bind(Date);
export const createPerformanceMarker = () => {
  const start = now();
  return () => now() - start;
};
