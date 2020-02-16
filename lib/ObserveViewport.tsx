import * as React from 'react';

import { ViewportContext } from './ViewportProvider';
import {
  createEmptyDimensionState,
  createEmptyScrollState,
} from './ViewportCollector';
import {
  Scroll,
  Dimensions,
  Viewport,
  ViewportChangeHandler,
  ViewportChangeOptions,
  PriorityType,
} from './types';
import {
  warnNoContextAvailable,
  requestAnimationFrame,
  cancelAnimationFrame,
} from './utils';

export interface IChildProps {
  scroll: Scroll | null;
  dimensions: Dimensions | null;
}

interface IState extends IChildProps {}

interface IProps {
  children?: (props: IChildProps) => React.ReactNode;
  onUpdate?: (props: IChildProps, layoutSnapshot: unknown) => void;
  recalculateLayoutBeforeUpdate?: (props: IChildProps) => unknown;
  disableScrollUpdates: boolean;
  disableDimensionsUpdates: boolean;
  deferUpdateUntilIdle: boolean;
  priority: PriorityType;
}

interface Context {
  addViewportChangeListener: (
    handler: ViewportChangeHandler,
    options: ViewportChangeOptions,
  ) => void;
  removeViewportChangeListener: (handler: ViewportChangeHandler) => void;
  scheduleReinitializeChangeHandler: (handler: ViewportChangeHandler) => void;
  hasRootProviderAsParent: boolean;
  getCurrentViewport: () => Viewport;
  version: string;
}

export default class ObserveViewport extends React.Component<IProps, IState> {
  private removeViewportChangeListener?: (
    handler: ViewportChangeHandler,
  ) => void;
  private scheduleReinitializeChangeHandler?: (
    handler: ViewportChangeHandler,
  ) => void;

  private tickId?: number;
  private nextViewport?: Viewport;

  static defaultProps: IProps = {
    disableScrollUpdates: false,
    disableDimensionsUpdates: false,
    deferUpdateUntilIdle: false,
    priority: 'normal',
  };

  constructor(props: IProps) {
    super(props);
    this.state = {
      scroll: createEmptyScrollState(),
      dimensions: createEmptyDimensionState(),
    };
  }

  componentDidUpdate(prevProps: IProps) {
    const dimensionsBecameActive =
      !this.props.disableDimensionsUpdates &&
      prevProps.disableDimensionsUpdates;
    const scrollBecameActive =
      !this.props.disableScrollUpdates && prevProps.disableScrollUpdates;
    if (
      typeof this.scheduleReinitializeChangeHandler === 'function' &&
      (dimensionsBecameActive || scrollBecameActive)
    ) {
      this.scheduleReinitializeChangeHandler(this.handleViewportUpdate);
    }
  }

  componentWillUnmount() {
    if (this.removeViewportChangeListener) {
      this.removeViewportChangeListener(this.handleViewportUpdate);
    }
    this.removeViewportChangeListener = undefined;
    this.scheduleReinitializeChangeHandler = undefined;
    if (typeof this.tickId === 'number') {
      cancelAnimationFrame(this.tickId);
    }
  }

  handleViewportUpdate = (viewport: Viewport, layoutSnapshot: unknown) => {
    if (this.props.onUpdate) {
      this.props.onUpdate(viewport, layoutSnapshot);
    }

    if (this.props.children) {
      this.syncState(viewport);
    }
  };

  syncState(nextViewport: Viewport) {
    this.nextViewport = nextViewport;
    if (this.tickId === undefined) {
      this.tickId = requestAnimationFrame(() => {
        if (this.nextViewport) {
          this.setState(this.nextViewport);
        }
        this.tickId = undefined;
        this.nextViewport = undefined;
      });
    }
  }

  get optionNotifyScroll(): boolean {
    return !this.props.disableScrollUpdates;
  }

  get optionNotifyDimensions(): boolean {
    return !this.props.disableDimensionsUpdates;
  }

  registerViewportListeners = ({
    addViewportChangeListener,
    removeViewportChangeListener,
    scheduleReinitializeChangeHandler,
    hasRootProviderAsParent,
    getCurrentViewport,
  }: Context): React.ReactNode => {
    if (!hasRootProviderAsParent) {
      warnNoContextAvailable('ObserveViewport');
      return null;
    }

    const shouldRegister =
      this.removeViewportChangeListener !== removeViewportChangeListener;

    if (!shouldRegister) {
      return null;
    }

    if (this.removeViewportChangeListener) {
      this.removeViewportChangeListener(this.handleViewportUpdate);
    }

    this.removeViewportChangeListener = removeViewportChangeListener;
    this.scheduleReinitializeChangeHandler = scheduleReinitializeChangeHandler;
    addViewportChangeListener(this.handleViewportUpdate, {
      notifyScroll: () => !this.props.disableScrollUpdates,
      notifyDimensions: () => !this.props.disableDimensionsUpdates,
      notifyOnlyWhenIdle: () => this.props.deferUpdateUntilIdle,
      priority: () => this.props.priority,
      recalculateLayoutBeforeUpdate: (viewport: Viewport) => {
        if (this.props.recalculateLayoutBeforeUpdate) {
          return this.props.recalculateLayoutBeforeUpdate(viewport);
        }
        return null;
      },
    });

    if (this.props.children) {
      this.syncState(getCurrentViewport());
    }

    return null;
  };

  render() {
    const { children } = this.props;
    return (
      <React.Fragment>
        <ViewportContext.Consumer>
          {this.registerViewportListeners}
        </ViewportContext.Consumer>
        {children ? children(this.state) : null}
      </React.Fragment>
    );
  }
}
