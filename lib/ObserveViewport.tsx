import * as React from 'react';
const memoize = require('memoize-one');
const raf = require('raf');

import { shallowEqualScroll, shallowEqualDimensions } from './utils';

import {
  Consumer,
  createInitScrollState,
  createInitDimensionsState,
  IScroll as IContextScroll,
  SCROLL_DIR_UP,
  SCROLL_DIR_DOWN,
  SCROLL_DIR_RIGHT,
  SCROLL_DIR_LEFT,
  IDimensions,
} from './ViewportProvider';

interface IState extends IContextScroll, IDimensions {}

export interface IScroll {
  x: number;
  y: number;
  xTurn: number;
  yTurn: number;
  xDTurn: number;
  yDTurn: number;
  isScrollingUp: boolean;
  isScrollingDown: boolean;
  isScrollingLeft: boolean;
  isScrollingRight: boolean;
}

export interface IChildProps {
  scroll: IScroll | null;
  dimensions: IDimensions | null;
}

interface IProps {
  children?: (props: IChildProps) => React.ReactNode;
  onUpdate?: (props: IChildProps) => void;
  disableScrollUpdates: boolean;
  disableDimensionsUpdates: boolean;
}

export default class ObserveViewport extends React.Component<IProps, IState> {
  tickId: NodeJS.Timer;
  scrollContext: IContextScroll;
  dimensionsContext: IDimensions;

  static defaultProps = {
    disableScrollUpdates: false,
    disableDimensionsUpdates: false,
  };

  constructor(props: IProps) {
    super(props);
    this.scrollContext = createInitScrollState();
    this.dimensionsContext = createInitDimensionsState();
    this.state = {
      ...this.scrollContext,
      ...this.dimensionsContext,
    };
  }

  shouldComponentUpdate(nextProps: IProps) {
    return Boolean(nextProps.children);
  }

  componentDidMount() {
    this.tick(this.syncState);
  }

  componentWillUnmount() {
    raf.cancel(this.tickId);
  }

  getPublicScroll = memoize(
    (scroll: IScroll): IScroll => scroll,
    shallowEqualScroll,
  );

  getPublicDimensions = memoize(
    (dimensions: IDimensions): IDimensions => dimensions,
    shallowEqualDimensions,
  );

  storeContext = (scrollContext: {
    scroll: IContextScroll;
    dimensions: IDimensions;
  }) => {
    this.scrollContext = scrollContext.scroll;
    this.dimensionsContext = scrollContext.dimensions;
    return null;
  };

  tick(updater: () => void) {
    this.tickId = raf(() => {
      if (this) {
        updater();
        this.tick(updater);
      }
    });
  }

  syncState = () => {
    const { disableScrollUpdates, disableDimensionsUpdates } = this.props;
    const nextState = {
      ...this.scrollContext,
      ...this.dimensionsContext,
    };
    const scrollDidUpdate = disableScrollUpdates
      ? false
      : !shallowEqualScroll(nextState as any, this.state as any);
    const dimensionsDidUpdate = disableDimensionsUpdates
      ? false
      : !shallowEqualDimensions(nextState as any, this.state as any);

    if (scrollDidUpdate || dimensionsDidUpdate) {
      if (this.props.onUpdate) {
        this.props.onUpdate(this.getPropsFromState(nextState));
      }
      this.setState(nextState);
    }
  };

  getPropsFromState(state: IState = this.state) {
    const { disableScrollUpdates, disableDimensionsUpdates } = this.props;
    const { xDir, yDir, width, height, ...scroll } = state;
    return {
      scroll: disableScrollUpdates
        ? null
        : this.getPublicScroll({
            ...scroll,
            isScrollingUp: yDir === SCROLL_DIR_UP,
            isScrollingDown: yDir === SCROLL_DIR_DOWN,
            isScrollingLeft: xDir === SCROLL_DIR_LEFT,
            isScrollingRight: xDir === SCROLL_DIR_RIGHT,
          }),
      dimensions: disableDimensionsUpdates
        ? null
        : this.getPublicDimensions({ width, height }),
    };
  }

  render() {
    const { children } = this.props;
    return (
      <React.Fragment>
        <Consumer>{this.storeContext}</Consumer>
        {typeof children === 'function' && children(this.getPropsFromState())}
      </React.Fragment>
    );
  }
}