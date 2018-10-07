import * as React from 'react';
import raf from 'raf';

import { Consumer } from './ViewportProvider';
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
} from './types';

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
}

interface IContext {
  addViewportChangeListener: (
    handler: TViewportChangeHandler,
    options: IViewportChangeOptions,
  ) => void;
  removeViewportChangeListener: (handler: TViewportChangeHandler) => void;
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

  static defaultProps = {
    disableScrollUpdates: false,
    disableDimensionsUpdates: false,
  };

  constructor(props: IProps) {
    super(props);
    this.state = {
      scroll: createInitScrollState(),
      dimensions: createInitDimensionsState(),
    };
  }

  shouldComponentUpdate(nextProps: IProps) {
    return Boolean(nextProps.children);
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

    this.tickId = raf(() => {
      this.setState(nextViewport);
    });
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
  }: IContext): React.ReactNode => {
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
        <Consumer>{this.registerViewportListeners}</Consumer>
        {typeof children === 'function' && children(this.state)}
      </React.Fragment>
    );
  }
}
