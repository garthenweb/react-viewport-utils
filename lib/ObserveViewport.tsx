import * as React from 'react';

import { ViewportContext } from './ViewportProvider';
import {
  createEmptyDimensionState,
  createEmptyScrollState,
} from './ViewportCollector';
import {
  IScroll,
  IDimensions,
  IViewport,
  TViewportChangeHandler,
  IViewportChangeOptions,
  PriorityType,
} from './types';
import {
  warnNoContextAvailable,
  requestAnimationFrame,
  cancelAnimationFrame,
} from './utils';

export interface IChildProps {
  scroll: IScroll | null;
  dimensions: IDimensions | null;
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

interface IContext {
  addViewportChangeListener: (
    handler: TViewportChangeHandler,
    options: IViewportChangeOptions,
  ) => void;
  removeViewportChangeListener: (handler: TViewportChangeHandler) => void;
  hasRootProviderAsParent: boolean;
  getCurrentViewport: () => IViewport;
  version: string;
}

export default class ObserveViewport extends React.Component<IProps, IState> {
  private getCurrentViewport?: () => IViewport;
  private removeViewportChangeListener?:
    | ((handler: TViewportChangeHandler) => void)
    | null;

  private tickId: number;

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
      typeof this.getCurrentViewport === 'function' &&
      (dimensionsBecameActive || scrollBecameActive)
    ) {
      const viewport = this.getCurrentViewport();
      this.handleViewportUpdate(
        viewport,
        this.props.recalculateLayoutBeforeUpdate
          ? this.props.recalculateLayoutBeforeUpdate(viewport)
          : null,
      );
    }
  }

  componentWillUnmount() {
    if (this.removeViewportChangeListener) {
      this.removeViewportChangeListener(this.handleViewportUpdate);
    }
    this.removeViewportChangeListener = null;
    cancelAnimationFrame(this.tickId);
  }

  handleViewportUpdate = (viewport: IViewport, layoutSnapshot: unknown) => {
    if (this.props.onUpdate) {
      this.props.onUpdate(viewport, layoutSnapshot);
    }

    if (this.props.children) {
      this.syncState(viewport);
    }
  };

  syncState(nextViewport: IState) {
    cancelAnimationFrame(this.tickId);
    this.tickId = requestAnimationFrame(() => {
      this.setState(nextViewport);
    });
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
    hasRootProviderAsParent,
    getCurrentViewport,
  }: IContext): React.ReactNode => {
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
    this.getCurrentViewport = getCurrentViewport;
    addViewportChangeListener(this.handleViewportUpdate, {
      notifyScroll: () => !this.props.disableScrollUpdates,
      notifyDimensions: () => !this.props.disableDimensionsUpdates,
      notifyOnlyWhenIdle: () => this.props.deferUpdateUntilIdle,
      priority: () => this.props.priority,
      recalculateLayoutBeforeUpdate: (viewport: IViewport) => {
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
