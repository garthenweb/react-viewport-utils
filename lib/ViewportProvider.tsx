import * as React from 'react';

import {
  TViewportChangeHandler,
  IViewportChangeOptions,
  IViewport,
  IViewportCollectorUpdateOptions,
} from './types';
import ViewportCollector from './ViewportCollector';

interface IListener extends IViewportChangeOptions {
  handler: TViewportChangeHandler;
}

export const ViewportContext = React.createContext({
  removeViewportChangeListener: (handler: TViewportChangeHandler) => {},
  addViewportChangeListener: (
    handler: TViewportChangeHandler,
    options: IViewportChangeOptions,
  ) => {},
  hasRootProviderAsParent: false,
  version: '__VERSION__',
});

export default class ViewportProvider extends React.PureComponent<
  {},
  { hasListeners: boolean }
> {
  private listeners: IListener[] = [];
  private updateListenersTick: NodeJS.Timer;

  constructor(props: {}) {
    super(props);
    this.state = {
      hasListeners: false,
    };
  }

  componentWillUnmount() {
    clearTimeout(this.updateListenersTick);
  }

  triggerUpdateToListeners = (
    state: IViewport,
    { scrollDidUpdate, dimensionsDidUpdate }: IViewportCollectorUpdateOptions,
    options?: { isIdle: boolean },
  ) => {
    const { isIdle } = Object.assign({ isIdle: false }, options);
    const updatableListeners = this.listeners.filter(
      ({ notifyScroll, notifyDimensions, notifyOnlyWhenIdle }) => {
        if (notifyOnlyWhenIdle() && !isIdle) {
          return false;
        }
        const updateForScroll = notifyScroll() && scrollDidUpdate;
        const updateForDimensions = notifyDimensions() && dimensionsDidUpdate;
        return updateForScroll || updateForDimensions;
      },
    );
    const layouts = updatableListeners.map(
      ({ recalculateLayoutBeforeUpdate }) => {
        if (recalculateLayoutBeforeUpdate) {
          return recalculateLayoutBeforeUpdate(state);
        }
        return null;
      },
    );

    updatableListeners.forEach(({ handler }, index) => {
      const layout = layouts[index];
      handler(state, layout);
    });
  };

  addViewportChangeListener = (
    handler: TViewportChangeHandler,
    options: IViewportChangeOptions,
  ) => {
    this.listeners.push({ handler, ...options });
    this.updateListenersLazy();
  };

  removeViewportChangeListener = (h: TViewportChangeHandler) => {
    this.listeners = this.listeners.filter(({ handler }) => handler !== h);
    this.updateListenersLazy();
  };

  updateListenersLazy() {
    clearTimeout(this.updateListenersTick);
    this.updateListenersTick = setTimeout(() => {
      this.setState({
        hasListeners: this.listeners.length !== 0,
      });
    }, 0);
  }

  renderChildren = (props: { hasRootProviderAsParent: boolean }) => {
    if (!props.hasRootProviderAsParent) {
      const value = {
        addViewportChangeListener: this.addViewportChangeListener,
        removeViewportChangeListener: this.removeViewportChangeListener,
        hasRootProviderAsParent: true,
        version: '__VERSION__',
      };
      return (
        <React.Fragment>
          {this.state.hasListeners && (
            <ViewportCollector
              onUpdate={this.triggerUpdateToListeners}
              onIdledUpdate={(state, updates) =>
                this.triggerUpdateToListeners(state, updates, { isIdle: true })
              }
            />
          )}
          <ViewportContext.Provider value={value}>
            {this.props.children}
          </ViewportContext.Provider>
        </React.Fragment>
      );
    }
    return this.props.children;
  };

  render() {
    return (
      <ViewportContext.Consumer>{this.renderChildren}</ViewportContext.Consumer>
    );
  }
}
