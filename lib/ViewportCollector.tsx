import * as React from 'react';
import memoize from 'memoize-one';

import {
  shallowEqualScroll,
  shallowEqualDimensions,
  browserSupportsPassiveEvents,
  simpleDebounce,
  debounceOnUpdate,
  warnNoResizeObserver,
  requestAnimationFrame,
  cancelAnimationFrame,
} from './utils';

import { Dimensions, Scroll, Viewport, OnUpdateType } from './types';

export const getClientDimensions = (): Dimensions => {
  if (typeof document === 'undefined' || !document.documentElement) {
    return createEmptyDimensionState();
  }
  const { innerWidth, innerHeight, outerWidth, outerHeight } = window;
  const {
    clientWidth,
    clientHeight,
    scrollHeight,
    scrollWidth,
    offsetHeight,
    offsetWidth,
  } = document.documentElement;
  return {
    width: innerWidth,
    height: innerHeight,
    clientWidth,
    clientHeight,
    outerWidth,
    outerHeight,
    documentWidth: Math.max(scrollWidth, offsetWidth, clientWidth),
    documentHeight: Math.max(scrollHeight, offsetHeight, clientHeight),
  };
};

const getNodeScroll = (elem = window) => {
  let { scrollX, scrollY } = elem;
  if (scrollX === undefined) {
    scrollX = elem.pageXOffset;
  }
  if (scrollY === undefined) {
    scrollY = elem.pageYOffset;
  }

  return {
    x: scrollX,
    y: scrollY,
  };
};

export const getClientScroll = (
  prevScrollState: Scroll = createEmptyScrollState(),
) => {
  if (typeof window === 'undefined') {
    return createEmptyScrollState();
  }
  const { x, y } = getNodeScroll();
  const nextScrollState = { ...prevScrollState };
  const {
    isScrollingLeft: prevIsScrollingLeft,
    isScrollingUp: prevIsScrollingUp,
    xTurn: prevXTurn,
    yTurn: prevYTurn,
  } = prevScrollState;

  nextScrollState.isScrollingLeft = isScrollingLeft(x, nextScrollState);
  nextScrollState.isScrollingRight = isScrollingRight(x, nextScrollState);

  nextScrollState.isScrollingUp = isScrollingUp(y, nextScrollState);
  nextScrollState.isScrollingDown = isScrollingDown(y, nextScrollState);

  nextScrollState.xTurn =
    nextScrollState.isScrollingLeft === prevIsScrollingLeft ? prevXTurn : x;
  nextScrollState.yTurn =
    nextScrollState.isScrollingUp === prevIsScrollingUp ? prevYTurn : y;

  nextScrollState.xDTurn = x - nextScrollState.xTurn;
  nextScrollState.yDTurn = y - nextScrollState.yTurn;

  nextScrollState.x = x;
  nextScrollState.y = y;

  return nextScrollState;
};

const isScrollingLeft = (x: number, prev: Scroll) => {
  switch (true) {
    case x < prev.x:
      return true;
    case x > prev.x:
      return false;
    case x === prev.x:
      return prev.isScrollingLeft;
    default:
      throw new Error('Could not calculate isScrollingLeft');
  }
};

const isScrollingRight = (x: number, prev: Scroll) => {
  switch (true) {
    case x > prev.x:
      return true;
    case x < prev.x:
      return false;
    case x === prev.x:
      return prev.isScrollingRight;
    default:
      throw new Error('Could not calculate isScrollingRight');
  }
};

const isScrollingUp = (y: number, prev: Scroll) => {
  switch (true) {
    case y < prev.y:
      return true;
    case y > prev.y:
      return false;
    case y === prev.y:
      return prev.isScrollingUp;
    default:
      throw new Error('Could not calculate isScrollingUp');
  }
};

const isScrollingDown = (y: number, prev: Scroll) => {
  switch (true) {
    case y > prev.y:
      return true;
    case y < prev.y:
      return false;
    case y === prev.y:
      return prev.isScrollingDown;
    default:
      throw new Error('Could not calculate isScrollingDown');
  }
};

export const createEmptyScrollState = () => ({
  x: 0,
  y: 0,
  isScrollingUp: false,
  isScrollingDown: false,
  isScrollingLeft: false,
  isScrollingRight: false,
  xTurn: 0,
  yTurn: 0,
  xDTurn: 0,
  yDTurn: 0,
});

export const createEmptyDimensionState = (): Dimensions => ({
  width: 0,
  height: 0,
  clientWidth: 0,
  clientHeight: 0,
  outerWidth: 0,
  outerHeight: 0,
  documentWidth: 0,
  documentHeight: 0,
});

interface IProps {
  onUpdate: OnUpdateType;
  onIdledUpdate?: OnUpdateType;
}

export default class ViewportCollector extends React.PureComponent<IProps> {
  public scrollState: Scroll;
  public dimensionsState: Dimensions;
  private lastSyncedScrollState: Scroll;
  private lastSyncedDimensionsState: Dimensions;
  private tickId?: number;
  private scrollMightHaveUpdated: boolean;
  private resizeMightHaveUpdated: boolean;
  private resizeObserver: ResizeObserver | null;
  public syncedStateOnce: boolean;

  constructor(props: IProps) {
    super(props);
    this.state = {
      parentProviderExists: false,
    };
    this.scrollMightHaveUpdated = false;
    this.resizeMightHaveUpdated = false;
    this.scrollState = createEmptyScrollState();
    this.dimensionsState = createEmptyDimensionState();
    this.lastSyncedDimensionsState = { ...this.dimensionsState };
    this.lastSyncedScrollState = { ...this.scrollState };
    this.resizeObserver = null;
    this.syncedStateOnce = false;
  }

  componentDidMount() {
    const options = browserSupportsPassiveEvents ? { passive: true } : false;
    window.addEventListener('scroll', this.handleScroll, options);
    window.addEventListener('resize', this.handleResizeDebounce, options);
    window.addEventListener(
      'orientationchange',
      this.handleResizeDebounce,
      options,
    );

    if (typeof window.ResizeObserver !== 'undefined') {
      this.resizeObserver = new window.ResizeObserver(
        this.handleResizeDebounce,
      );
      this.resizeObserver!.observe(document.body);
    } else {
      warnNoResizeObserver();
    }

    this.handleScroll();
    this.handleResize();
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll, false);
    window.removeEventListener('resize', this.handleResizeDebounce, false);
    window.removeEventListener(
      'orientationchange',
      this.handleResizeDebounce,
      false,
    );
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (typeof this.tickId === 'number') {
      cancelAnimationFrame(this.tickId);
    }
  }

  tick = () => {
    if (this) {
      if (this.scrollMightHaveUpdated || this.resizeMightHaveUpdated) {
        this.syncState();
        this.scrollMightHaveUpdated = false;
        this.resizeMightHaveUpdated = false;
      }
      this.tickId = undefined;
    }
  };

  handleScroll = () => {
    this.scrollMightHaveUpdated = true;
    if (!this.tickId) {
      this.tickId = requestAnimationFrame(this.tick);
    }
  };

  handleResize = () => {
    this.resizeMightHaveUpdated = true;
    if (!this.tickId) {
      this.tickId = requestAnimationFrame(this.tick);
    }
  };

  handleResizeDebounce = simpleDebounce(this.handleResize, 88);

  getPublicScroll = memoize(
    (scroll: Scroll): Scroll => ({ ...scroll }),
    ([a]: Array<Scroll>, [b]: Array<Scroll>) => shallowEqualScroll(a, b),
  );

  getPublicDimensions = memoize(
    (dimensions: Dimensions): Dimensions => ({ ...dimensions }),
    ([a]: Array<Dimensions>, [b]: Array<Dimensions>) =>
      shallowEqualDimensions(a, b),
  );

  syncState = () => {
    if (!this.syncedStateOnce) {
      this.syncedStateOnce = true;
    }
    if (this.scrollMightHaveUpdated) {
      Object.assign(this.scrollState, getClientScroll(this.scrollState));
    }
    if (this.resizeMightHaveUpdated) {
      Object.assign(this.dimensionsState, getClientDimensions());
    }
    const scrollDidUpdate =
      this.scrollMightHaveUpdated &&
      !shallowEqualScroll(this.lastSyncedScrollState, this.scrollState);
    const dimensionsDidUpdate =
      this.resizeMightHaveUpdated &&
      !shallowEqualDimensions(
        this.lastSyncedDimensionsState,
        this.dimensionsState,
      );

    if (scrollDidUpdate) {
      this.lastSyncedScrollState = { ...this.scrollState };
    }

    if (dimensionsDidUpdate) {
      this.lastSyncedDimensionsState = { ...this.dimensionsState };
    }

    if (scrollDidUpdate || dimensionsDidUpdate) {
      const publicState = this.getPropsFromState();
      this.props.onUpdate(publicState, {
        scrollDidUpdate,
        dimensionsDidUpdate,
      });
      this.updateOnIdle(publicState, {
        scrollDidUpdate,
        dimensionsDidUpdate,
      });
    }
  };

  updateOnIdle = debounceOnUpdate((...args) => {
    if (typeof this.props.onIdledUpdate === 'function') {
      this.props.onIdledUpdate(...args);
    }
  }, 166);

  getPropsFromState(): Viewport {
    return {
      scroll: this.getPublicScroll(this.lastSyncedScrollState),
      dimensions: this.getPublicDimensions(this.lastSyncedDimensionsState),
    };
  }

  render() {
    return null;
  }
}
