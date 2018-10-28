import * as React from 'react';
import raf from 'raf';

import { ViewportContext } from './ViewportProvider';
import {
  createInitDimensionsState,
  createInitScrollState,
} from './ViewportCollector';
import {
  IScroll,
  IDimensions,
  IViewport,
  TViewportChangeHandler,
  IViewportChangeOptions,
  PriorityType,
} from './types';
import { warnNoContextAvailable } from './utils';

export interface IChildProps {
  scroll: IScroll | null;
  dimensions: IDimensions | null;
}

interface IState extends IChildProps {}

interface IProps {
  children?: (props: IChildProps) => React.ReactNode;
  onUpdate?: (props: IChildProps, layoutSnapshot: any) => void;
  recalculateLayoutBeforeUpdate?: (props: IChildProps) => any;
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
  version: string;
}

export default class ObserveViewport extends React.Component<IProps, IState> {
  private addViewportChangeListener:
    | ((
        handler: TViewportChangeHandler,
        options: IViewportChangeOptions,
      ) => void)
    | null;
  private removeViewportChangeListener:
    | ((handler: TViewportChangeHandler) => void)
    | null;

  private tickId: NodeJS.Timer;

  static defaultProps: IProps = {
    disableScrollUpdates: false,
    disableDimensionsUpdates: false,
    deferUpdateUntilIdle: false,
    priority: 'normal',
  };

  constructor(props: IProps) {
    super(props);
    this.state = {
      scroll: createInitScrollState(),
      dimensions: createInitDimensionsState(),
    };
  }

  componentWillUnmount() {
    if (this.removeViewportChangeListener) {
      this.removeViewportChangeListener(this.handleViewportUpdate);
    }
    this.removeViewportChangeListener = null;
    this.addViewportChangeListener = null;
    raf.cancel(this.tickId);
  }

  handleViewportUpdate = (viewport: IViewport, layoutSnapshot: any) => {
    const scroll = this.props.disableScrollUpdates ? null : viewport.scroll;
    const dimensions = this.props.disableDimensionsUpdates
      ? null
      : viewport.dimensions;
    const nextViewport = {
      scroll: scroll,
      dimensions: dimensions,
    };

    if (this.props.onUpdate) {
      this.props.onUpdate(nextViewport, layoutSnapshot);
    }

    if (this.props.children) {
      raf.cancel(this.tickId);
      this.tickId = raf(() => {
        this.setState(nextViewport);
      });
    }
  };

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
  }: IContext): React.ReactNode => {
    if (!hasRootProviderAsParent) {
      warnNoContextAvailable('ObserveViewport');
      return null;
    }

    const shouldRegister =
      this.removeViewportChangeListener !== removeViewportChangeListener &&
      this.addViewportChangeListener !== addViewportChangeListener;

    if (!shouldRegister) {
      return null;
    }

    if (this.removeViewportChangeListener) {
      this.removeViewportChangeListener(this.handleViewportUpdate);
    }

    this.removeViewportChangeListener = removeViewportChangeListener;
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

    return null;
  };

  render() {
    const { children } = this.props;
    return (
      <React.Fragment>
        <ViewportContext.Consumer>
          {this.registerViewportListeners}
        </ViewportContext.Consumer>
        {typeof children === 'function' && children(this.state)}
      </React.Fragment>
    );
  }
}
