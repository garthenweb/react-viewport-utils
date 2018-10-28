import * as React from 'react';

import {
  TViewportChangeHandler,
  IViewportChangeOptions,
  IViewport,
  IViewportCollectorUpdateOptions,
} from './types';
import ViewportCollector from './ViewportCollector';

interface IProps {
  experimentalSchedulerEnabled?: boolean;
}

interface IListener extends IViewportChangeOptions {
  handler: TViewportChangeHandler;
  iterations: number;
  averageExecutionCost: number;
  skippedIterations: number;
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

const maxIterations = (priority: 'highest' | 'high' | 'normal' | 'low') => {
  switch (priority) {
    case 'highest':
      return 0;
    case 'high':
      return 4;
    case 'normal':
      return 16;
    case 'low':
      return 64;
  }
};

const shouldSkipIteration = (
  { priority: getPriority, averageExecutionCost, skippedIterations }: IListener,
  budget: number,
): boolean => {
  const priority = getPriority();
  if (priority === 'highest') {
    return false;
  }
  if (priority !== 'low' && averageExecutionCost <= budget) {
    return false;
  }
  if (averageExecutionCost <= budget / 10) {
    return false;
  }
  const probability = skippedIterations / maxIterations(priority);
  if (probability >= 1) {
    return false;
  }
  return Math.random() > probability;
};

export default class ViewportProvider extends React.PureComponent<
  IProps,
  { hasListeners: boolean }
> {
  static defaultProps: {
    experimentalSchedulerEnabled: false;
  };
  private listeners: IListener[] = [];
  private updateListenersTick: NodeJS.Timer;

  constructor(props: IProps) {
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
    let updatableListeners = this.listeners.filter(
      ({ notifyScroll, notifyDimensions, notifyOnlyWhenIdle }) => {
        if (notifyOnlyWhenIdle() && !isIdle) {
          return false;
        }
        const updateForScroll = notifyScroll() && scrollDidUpdate;
        const updateForDimensions = notifyDimensions() && dimensionsDidUpdate;
        return updateForScroll || updateForDimensions;
      },
    );
    if (this.props.experimentalSchedulerEnabled) {
      if (!isIdle) {
        const budget = 16 / updatableListeners.length;
        updatableListeners = updatableListeners.filter(listener => {
          const skip = shouldSkipIteration(listener, budget);
          if (skip) {
            listener.skippedIterations++;
            return false;
          }
          listener.skippedIterations = 0;
          return true;
        });
      }
    }
    const layouts = updatableListeners.map(
      ({ recalculateLayoutBeforeUpdate }) => {
        if (recalculateLayoutBeforeUpdate) {
          const start = performance.now();
          const layoutState = recalculateLayoutBeforeUpdate(state);
          return [layoutState, performance.now() - start];
        }
        return null;
      },
    );

    updatableListeners.forEach((listener, index) => {
      const { handler, averageExecutionCost, iterations } = listener;
      const [layout, layoutCost] = layouts[index] || [null, 0];

      const start = performance.now();
      handler(state, layout);
      const totalCost = layoutCost + performance.now() - start;
      const diff = totalCost - averageExecutionCost;
      const i = iterations + 1;

      listener.averageExecutionCost = averageExecutionCost + diff / i;
      listener.iterations = i;
    });
  };

  addViewportChangeListener = (
    handler: TViewportChangeHandler,
    options: IViewportChangeOptions,
  ) => {
    this.listeners.push({
      handler,
      iterations: 0,
      averageExecutionCost: 0,
      skippedIterations: 0,
      ...options,
    });
    this.updateHasListenersState();
  };

  removeViewportChangeListener = (h: TViewportChangeHandler) => {
    this.listeners = this.listeners.filter(({ handler }) => handler !== h);
    this.updateHasListenersState();
  };

  updateHasListenersState() {
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
