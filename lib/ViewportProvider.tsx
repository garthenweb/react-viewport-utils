import * as React from 'react';

import {
  TViewportChangeHandler,
  IViewportChangeOptions,
  IViewport,
  IViewportCollectorUpdateOptions,
} from './types';
import ViewportCollector from './ViewportCollector';
import { VERSION } from './index';

interface IListener extends IViewportChangeOptions {
  handler: TViewportChangeHandler;
}

const ViewportContext = React.createContext({
  removeViewportChangeListener: (handler: TViewportChangeHandler) => {},
  addViewportChangeListener: (
    handler: TViewportChangeHandler,
    options: IViewportChangeOptions,
  ) => {},
  hasRootProviderAsParent: false,
  version: VERSION,
});

export const Consumer = ViewportContext.Consumer;

export default class ViewportProvider extends React.PureComponent {
  private listeners: IListener[] = [];

  updateListeners = (
    publicState: IViewport,
    { scrollDidUpdate, dimensionsDidUpdate }: IViewportCollectorUpdateOptions,
  ) => {
    const updatableListeners = this.listeners.filter(
      ({ notifyScroll, notifyDimensions }) =>
        (notifyScroll() && scrollDidUpdate) ||
        (notifyDimensions() && dimensionsDidUpdate),
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
  };

  addViewportChangeListener = (
    handler: TViewportChangeHandler,
    options: IViewportChangeOptions,
  ) => {
    this.listeners.push({ handler, ...options });
  };

  removeViewportChangeListener = (h: TViewportChangeHandler) => {
    this.listeners = this.listeners.filter(({ handler }) => handler !== h);
  };

  renderChildren = (props: { hasRootProviderAsParent: boolean }) => {
    if (!props.hasRootProviderAsParent) {
      const value = {
        addViewportChangeListener: this.addViewportChangeListener,
        removeViewportChangeListener: this.removeViewportChangeListener,
        hasRootProviderAsParent: true,
        version: VERSION,
      };
      return (
        <React.Fragment>
          <ViewportCollector onUpdate={this.updateListeners} />
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
