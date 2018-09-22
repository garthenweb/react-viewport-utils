import * as React from 'react';
import throttle from 'lodash.throttle';
import debounce from 'lodash.debounce';
import memoize from 'memoize-one';
import raf from 'raf';

import {
  shallowEqualScroll,
  shallowEqualPrivateScroll,
  shallowEqualDimensions,
} from './utils';
import {
  IDimensions,
  IPrivateScroll,
  IScroll,
  TViewportChangeHandler,
  IViewportChangeOptions,
} from './types';

interface IListener extends IViewportChangeOptions {
  handler: TViewportChangeHandler;
}

export const SCROLL_DIR_DOWN = Symbol('SCROLL_DIR_DOWN');
export const SCROLL_DIR_UP = Symbol('SCROLL_DIR_UP');
export const SCROLL_DIR_LEFT = Symbol('SCROLL_DIR_LEFT');
export const SCROLL_DIR_RIGHT = Symbol('SCROLL_DIR_RIGHT');

const ViewportContext = React.createContext({
  removeViewportChangeListener: (
    handler: TViewportChangeHandler,
    options: IViewportChangeOptions,
  ) => {},
  addViewportChangeListener: (
    handler: TViewportChangeHandler,
    options: IViewportChangeOptions,
  ) => {},
});

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

const getClientDimensions = () => {
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  };
};

const getXDir = (x: number, prev: IPrivateScroll) => {
  switch (true) {
    case x < prev.x:
      return SCROLL_DIR_LEFT;
    case x > prev.x:
      return SCROLL_DIR_RIGHT;
    case x === prev.x:
      return prev.xDir === SCROLL_DIR_LEFT ? SCROLL_DIR_RIGHT : SCROLL_DIR_LEFT;
    default:
      throw new Error('Could not calculate xDir');
  }
};

const getYDir = (y: number, prev: IPrivateScroll) => {
  switch (true) {
    case y < prev.y:
      return SCROLL_DIR_UP;
    case y > prev.y:
      return SCROLL_DIR_DOWN;
    case y === prev.y:
      return prev.yDir === SCROLL_DIR_UP ? SCROLL_DIR_DOWN : SCROLL_DIR_UP;
    default:
      throw new Error('Could not calculate yDir');
  }
};

const privateToPublisScroll = ({
  yDir,
  xDir,
  ...scroll
}: IPrivateScroll): IScroll => {
  return {
    ...scroll,
    isScrollingUp: yDir === SCROLL_DIR_UP,
    isScrollingDown: yDir === SCROLL_DIR_DOWN,
    isScrollingLeft: xDir === SCROLL_DIR_LEFT,
    isScrollingRight: xDir === SCROLL_DIR_RIGHT,
  };
};

const createInitPrivateScrollState = () => ({
  x: 0,
  y: 0,
  xDir: undefined,
  yDir: undefined,
  xTurn: 0,
  yTurn: 0,
  xDTurn: 0,
  yDTurn: 0,
});

export const createInitScrollState = (): IScroll =>
  privateToPublisScroll(createInitPrivateScrollState());

export const createInitDimensionsState = () => {
  if (typeof window === 'undefined') {
    return {
      width: 0,
      height: 0,
    };
  }
  return getClientDimensions();
};

export const Consumer = ViewportContext.Consumer;
export default class ViewportProvider extends React.PureComponent {
  private scrollState: IPrivateScroll;
  private dimensionsState: IDimensions;
  private lastSyncedScrollState: IPrivateScroll;
  private lastSyncedDimensionsState: IDimensions;
  private tickId: NodeJS.Timer;
  private componentMightHaveUpdated: boolean;
  private listeners: IListener[] = [];

  constructor(props: {}) {
    super(props);
    this.scrollState = createInitPrivateScrollState();
    this.dimensionsState = createInitDimensionsState();
    this.lastSyncedDimensionsState = { ...this.dimensionsState };
    this.lastSyncedScrollState = { ...this.scrollState };
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll, false);
    window.addEventListener('resize', this.handleResize, false);
    window.addEventListener('orientationchange', this.handleResize, false);

    this.tickId = raf(this.tick);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll, false);
    window.removeEventListener('resize', this.handleResize, false);
    window.removeEventListener('orientationchange', this.handleResize, false);
    raf.cancel(this.tickId);
    this.listeners = [];
  }

  tick = () => {
    if (this) {
      if (this.componentMightHaveUpdated) {
        this.syncState();
      }
      this.componentMightHaveUpdated = false;
      this.tickId = raf(this.tick);
    }
  };

  handleScroll = throttle(
    () => {
      const { x, y } = getNodeScroll();
      const {
        xDir: prevXDir,
        yDir: prevYDir,
        xTurn: prevXTurn,
        yTurn: prevYTurn,
      } = this.scrollState;

      this.scrollState.xDir = getXDir(x, this.scrollState);
      this.scrollState.yDir = getYDir(y, this.scrollState);

      this.scrollState.xTurn =
        this.scrollState.xDir === prevXDir ? prevXTurn : x;
      this.scrollState.yTurn =
        this.scrollState.yDir === prevYDir ? prevYTurn : y;

      this.scrollState.xDTurn = x - this.scrollState.xTurn;
      this.scrollState.yDTurn = y - this.scrollState.yTurn;

      this.scrollState.x = x;
      this.scrollState.y = y;

      this.componentMightHaveUpdated = true;
    },
    16,
    {
      leading: true,
      trailing: false,
    },
  );

  handleResize = debounce(() => {
    const { width, height } = getClientDimensions();
    this.dimensionsState.width = width;
    this.dimensionsState.height = height;

    this.componentMightHaveUpdated = true;
  }, 80);

  getPublicScroll: ((scroll: IScroll) => IScroll) = memoize(
    (scroll: IScroll): IScroll => scroll,
    shallowEqualScroll,
  );

  getPublicDimensions: ((dimensions: IDimensions) => IDimensions) = memoize(
    (dimensions: IDimensions): IDimensions => dimensions,
    shallowEqualDimensions,
  );

  syncState = () => {
    const scrollDidUpdate = !shallowEqualPrivateScroll(
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
      const updatableListeners = this.listeners.filter(
        ({ notifyScroll, notifyDimensions }) =>
          (notifyScroll && scrollDidUpdate) ||
          (notifyDimensions && dimensionsDidUpdate),
      );
      const layouts = updatableListeners.map(
        ({ recalculateLayoutBeforeUpdate }) => {
          if (recalculateLayoutBeforeUpdate) {
            return recalculateLayoutBeforeUpdate(publicState);
          }
          return null;
        },
      );

      updatableListeners.forEach(({ handler }, index) => {
        const layout = layouts[index];
        handler(publicState, layout);
      });
    }
  };

  getPropsFromState() {
    return {
      scroll: this.getPublicScroll(
        privateToPublisScroll(this.lastSyncedScrollState),
      ),
      dimensions: this.getPublicDimensions({
        ...this.lastSyncedDimensionsState,
      }),
    };
  }

  addViewportChangeListener = (
    handler: TViewportChangeHandler,
    options: IViewportChangeOptions,
  ) => {
    this.listeners.push({ handler, ...options });
  };

  removeViewportChangeListener = (
    h: TViewportChangeHandler,
    options: IViewportChangeOptions,
  ) => {
    this.listeners = this.listeners.filter(
      ({ handler, notifyScroll, notifyDimensions }) => {
        const equals =
          handler === h &&
          notifyScroll === options.notifyScroll &&
          notifyDimensions === options.notifyDimensions;
        return !equals;
      },
    );
  };

  render() {
    const value = {
      addViewportChangeListener: this.addViewportChangeListener,
      removeViewportChangeListener: this.removeViewportChangeListener,
    };

    return (
      <ViewportContext.Provider value={value}>
        {this.props.children}
      </ViewportContext.Provider>
    );
  }
}
