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

  return a.width === b.width && a.height === b.height;
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
  const type = location.startsWith('use') ? 'hook' : 'component';
  console.warn(
    `react-viewport-utils: ${name} ${type} is not able to connect to a <ViewportProvider>. Therefore it cannot detect updates from the viewport and will not work as expected. To resolve this issue please add a <ViewportProvider> as a parent of the <ObserveViewport> component, e.g. directly in the ReactDOM.render call:

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
