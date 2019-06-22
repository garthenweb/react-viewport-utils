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

import { IDimensions, IScroll, IViewport, OnUpdateType } from './types';

export const getClientDimensions = (): IDimensions => {
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
  prevScrollState: IScroll = createEmptyScrollState(),
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
  nextScrollState.isScrollingRight = !nextScrollState.isScrollingLeft;

  nextScrollState.isScrollingUp = isScrollingUp(y, nextScrollState);
  nextScrollState.isScrollingDown = !nextScrollState.isScrollingUp;

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

const isScrollingLeft = (x: number, prev: IScroll) => {
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

const isScrollingUp = (y: number, prev: IScroll) => {
  switch (true) {
    case y < prev.y:
      return true;
    case y > prev.y:
      return false;
    case y === prev.y:
      return prev.isScrollingUp;
    default:
      throw new Error('Could not calculate yDir');
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

export const createEmptyDimensionState = (): IDimensions => ({
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
  private scrollState: IScroll;
  private dimensionsState: IDimensions;
  private lastSyncedScrollState: IScroll;
  private lastSyncedDimensionsState: IDimensions;
  private tickId?: number;
  private componentMightHaveUpdated: boolean;
  private resizeObserver: ResizeObserver | null;

  constructor(props: IProps) {
    super(props);
    this.state = {
      parentProviderExists: false,
    };
    this.componentMightHaveUpdated = false;
    this.scrollState = createEmptyScrollState();
    this.dimensionsState = createEmptyDimensionState();
    this.lastSyncedDimensionsState = { ...this.dimensionsState };
    this.lastSyncedScrollState = { ...this.scrollState };
    this.resizeObserver = null;
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
    this.tickId = requestAnimationFrame(this.tick);
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
      if (this.componentMightHaveUpdated) {
        this.syncState();
      }
      this.componentMightHaveUpdated = false;
      this.tickId = requestAnimationFrame(this.tick);
    }
  };

  handleScroll = () => {
    Object.assign(this.scrollState, getClientScroll(this.scrollState));
    this.componentMightHaveUpdated = true;
  };

  handleResize = () => {
    Object.assign(this.dimensionsState, getClientDimensions());
    this.componentMightHaveUpdated = true;
  };

  handleResizeDebounce = simpleDebounce(this.handleResize, 88);

  getPublicScroll = memoize(
    (scroll: IScroll): IScroll => ({ ...scroll }),
    ([a]: [IScroll], [b]: [IScroll]) => shallowEqualScroll(a, b),
  );

  getPublicDimensions = memoize(
    (dimensions: IDimensions): IDimensions => ({ ...dimensions }),
    ([a]: [IDimensions], [b]: [IDimensions]) => shallowEqualDimensions(a, b),
  );

  syncState = () => {
    const scrollDidUpdate = !shallowEqualScroll(
      this.lastSyncedScrollState,
      this.scrollState,
    );
    const dimensionsDidUpdate = !shallowEqualDimensions(
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

  getPropsFromState(): IViewport {
    return {
      scroll: this.getPublicScroll(this.lastSyncedScrollState),
      dimensions: this.getPublicDimensions(this.lastSyncedDimensionsState),
    };
  }

  render() {
    return null;
  }
}
