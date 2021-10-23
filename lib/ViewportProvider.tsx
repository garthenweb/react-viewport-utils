import * as React from 'react';

import {
  ViewportChangeHandler,
  ViewportChangeOptions,
  Viewport,
  ViewportCollectorUpdateOptions,
} from './types';
import ViewportCollector, {
  getClientDimensions,
  getClientScroll,
} from './ViewportCollector';
import {
  createPerformanceMarker,
  now,
  requestAnimationFrame,
  cancelAnimationFrame,
} from './utils';

interface Props {
  experimentalSchedulerEnabled?: boolean;
  experimentalSchedulerLayoutCalculatorEnabled?: boolean;
}

interface Listener extends ViewportChangeOptions {
  handler: ViewportChangeHandler;
  iterations: number;
  initialized: boolean;
  averageExecutionCost: number;
  skippedIterations: number;
}

const createFallbackViewportRequester = () => {
  let defaultValue: Viewport;
  let lastAccess = 0;
  return (): Viewport => {
    if (!defaultValue || now() - lastAccess > 1000) {
      defaultValue = {
        scroll: getClientScroll(),
        dimensions: getClientDimensions(),
      };
      lastAccess = now();
    }
    return defaultValue;
  };
};

export const ViewportContext = React.createContext({
  removeViewportChangeListener: (handler: ViewportChangeHandler) => {},
  scheduleReinitializeChangeHandler: (handler: ViewportChangeHandler) => {},
  addViewportChangeListener: (
    handler: ViewportChangeHandler,
    options: ViewportChangeOptions,
  ) => {},
  getCurrentViewport: createFallbackViewportRequester(),
  hasRootProviderAsParent: false,
  version: '_VERS_',
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
  { priority: getPriority, averageExecutionCost, skippedIterations }: Listener,
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
  Props,
  { hasListeners: boolean }
> {
  static defaultProps: {
    experimentalSchedulerEnabled: false;
    experimentalSchedulerLayoutCalculatorEnabled: false;
  };
  private listeners: Listener[] = [];
  private updateListenersTick?: NodeJS.Timer;
  private initializeListenersTick?: number;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasListeners: false,
    };
  }

  componentWillUnmount() {
    if (typeof this.updateListenersTick === 'number') {
      clearTimeout(this.updateListenersTick);
    }
    if (typeof this.initializeListenersTick === 'number') {
      cancelAnimationFrame(this.initializeListenersTick);
    }
  }

  triggerUpdateToListeners = (
    state: Viewport,
    { scrollDidUpdate, dimensionsDidUpdate }: ViewportCollectorUpdateOptions,
    options?: { isIdle?: boolean; shouldInitialize?: boolean },
  ) => {
    const getOverallDuration = createPerformanceMarker();
    const { isIdle, shouldInitialize } = Object.assign(
      { isIdle: false, shouldInitialize: false },
      options,
    );
    let updatableListeners = this.listeners.filter(
      ({
        notifyScroll,
        notifyDimensions,
        notifyOnlyWhenIdle,
        skippedIterations,
        initialized,
      }) => {
        const needsUpdate = skippedIterations > 0;
        if (notifyOnlyWhenIdle() !== isIdle && !needsUpdate) {
          return false;
        }
        if (shouldInitialize && !initialized) {
          return true;
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
          const skip = listener.initialized
            ? shouldSkipIteration(listener, budget)
            : false;
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
          const getDuration = createPerformanceMarker();
          const layoutState = recalculateLayoutBeforeUpdate(state);
          return [layoutState, getDuration()] as const;
        }
        return null;
      },
    );
    let overallJSHandlerTotalCost = 0;
    updatableListeners.forEach((listener, index) => {
      const { handler, averageExecutionCost, iterations } = listener;
      const [layout, layoutCost] = layouts[index] || [null, 0];

      const getDuration = createPerformanceMarker();
      handler(state, layout);
      const totalCost = layoutCost + getDuration();
      const diff = totalCost - averageExecutionCost;
      const i = iterations + 1;

      listener.averageExecutionCost = averageExecutionCost + diff / i;
      listener.iterations = i;
      listener.initialized = true;
      overallJSHandlerTotalCost += totalCost;
    });
    if (
      this.props.experimentalSchedulerLayoutCalculatorEnabled &&
      updatableListeners.length
    ) {
      setTimeout(() => {
        const diffPerHandler =
          (getOverallDuration() - overallJSHandlerTotalCost) /
          updatableListeners.length;
        updatableListeners.forEach(listener => {
          listener.averageExecutionCost =
            listener.averageExecutionCost +
            diffPerHandler / listener.iterations;
        });
      }, 0);
    }
  };

  addViewportChangeListener = (
    handler: ViewportChangeHandler,
    options: ViewportChangeOptions,
  ) => {
    this.listeners.push({
      handler,
      iterations: 0,
      averageExecutionCost: 0,
      skippedIterations: 0,
      initialized: false,
      ...options,
    });
    this.handleListenerUpdate();
  };

  scheduleReinitializeChangeHandler = (h: ViewportChangeHandler) => {
    const listener = this.listeners.find(({ handler }) => handler === h);
    if (listener && listener.initialized) {
      listener.initialized = false;
      this.handleListenerUpdate();
    }
  };

  removeViewportChangeListener = (h: ViewportChangeHandler) => {
    this.listeners = this.listeners.filter(({ handler }) => handler !== h);
    this.handleListenerUpdate();
  };

  handleListenerUpdate() {
    if (this.updateListenersTick === undefined) {
      this.updateListenersTick = setTimeout(() => {
        const nextState = this.listeners.length !== 0;
        if (this.state.hasListeners !== nextState) {
          this.setState({
            hasListeners: this.listeners.length !== 0,
          });
        }
        this.updateListenersTick = undefined;
      }, 1);
    }
    if (this.initializeListenersTick === undefined) {
      this.initializeListenersTick = requestAnimationFrame(() => {
        if (
          this.collector.current &&
          this.collector.current.syncedStateOnce &&
          this.listeners.some(l => !l.initialized)
        ) {
          this.triggerUpdateToListeners(
            this.collector.current.getPropsFromState(),
            {
              dimensionsDidUpdate: false,
              scrollDidUpdate: false,
            },
            {
              isIdle: false,
              shouldInitialize: true,
            },
          );
        }
        this.initializeListenersTick = undefined;
      });
    }
  }

  private collector = React.createRef<ViewportCollector>();
  private getCurrentDefaultViewport = createFallbackViewportRequester();
  private contextValue = {
    addViewportChangeListener: this.addViewportChangeListener,
    removeViewportChangeListener: this.removeViewportChangeListener,
    scheduleReinitializeChangeHandler: this.scheduleReinitializeChangeHandler,
    getCurrentViewport: () => {
      if (this.collector.current && this.collector.current.syncedStateOnce) {
        return this.collector.current.getPropsFromState();
      }
      return this.getCurrentDefaultViewport();
    },
    hasRootProviderAsParent: true,
    version: '_VERS_',
  };

  renderChildren = (props: {
    hasRootProviderAsParent: boolean;
    version: string;
  }) => {
    if (props.hasRootProviderAsParent) {
      if (
        process.env.NODE_ENV !== 'production' &&
        props.version !== '_VERS_'
      ) {
        console.warn(
          `react-viewport-utils: Two different versions of the react-viewport-utils library are used in the same react tree. This can lead to unexpected results as the versions might not be compatible.
The <ViewportProvider> of version ${props.version} is currently used, another <ViewportProvider> of version _VERS_ was detected but is ignored.
This is most probably due to some dependencies that use different versions of the react-viewport-utils library. You can check if an update is possible.`,
        );
      }
      return this.props.children;
    }
    return (
      <React.Fragment>
        {this.state.hasListeners && (
          <ViewportCollector
            ref={this.collector}
            onUpdate={this.triggerUpdateToListeners}
            onIdledUpdate={(state, updates) =>
              this.triggerUpdateToListeners(state, updates, { isIdle: true })
            }
          />
        )}
        <ViewportContext.Provider value={this.contextValue}>
          {this.props.children}
        </ViewportContext.Provider>
      </React.Fragment>
    );
  };

  render() {
    return (
      <ViewportContext.Consumer>{this.renderChildren}</ViewportContext.Consumer>
    );
  }
}
