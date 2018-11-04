import { useContext, useEffect, useState } from 'react';

import { ViewportContext } from './ViewportProvider';
import {
  createInitScrollState,
  createInitDimensionsState,
} from './ViewportCollector';
import { IViewport, IScroll, IDimensions, PriorityType } from './types';
import { warnNoContextAvailable } from './utils';

interface IViewPortEffectOptions extends IFullOptions {
  recalculateLayoutBeforeUpdate?: (viewport: IViewport) => any;
}

interface IFullOptions extends IOptions {
  disableScrollUpdates?: boolean;
  disableDimensionsUpdates?: boolean;
}

interface IOptions {
  deferUpdateUntilIdle?: boolean;
  priority?: PriorityType;
}

type HandleViewportChangeType = (viewport: IViewport, snapshot: any) => void;

const useViewportEffect = (
  handleViewportChange: HandleViewportChangeType,
  options: IViewPortEffectOptions,
) => {
  const {
    addViewportChangeListener,
    removeViewportChangeListener,
    hasRootProviderAsParent,
  } = useContext(ViewportContext);

  if (!hasRootProviderAsParent) {
    warnNoContextAvailable('useViewport');
    return;
  }

  useEffect(
    () => {
      addViewportChangeListener(handleViewportChange, {
        notifyScroll: () => !options.disableScrollUpdates,
        notifyDimensions: () => !options.disableDimensionsUpdates,
        notifyOnlyWhenIdle: () => Boolean(options.deferUpdateUntilIdle),
        priority: () => options.priority || 'normal',
        recalculateLayoutBeforeUpdate: options.recalculateLayoutBeforeUpdate,
      });
      return () => removeViewportChangeListener(handleViewportChange);
    },
    [addViewportChangeListener, removeViewportChangeListener],
  );
};

export const useScroll = (options: IOptions = {}): IScroll => {
  const { scroll } = useViewport({
    disableDimensionsUpdates: true,
    ...options,
  });

  return scroll;
};

export const useDimensions = (options: IOptions = {}): IDimensions => {
  const { dimensions } = useViewport({
    disableScrollUpdates: true,
    ...options,
  });

  return dimensions;
};

export const useViewport = (options: IFullOptions = {}): IViewport => {
  const [state, setViewport] = useState({
    scroll: createInitScrollState(),
    dimensions: createInitDimensionsState(),
  });
  useViewportEffect(setViewport, options);

  return state;
};

export const useLayoutSnapshot = <T = any>(
  recalculateLayoutBeforeUpdate: (viewport: IViewport) => T,
  options: IFullOptions = {},
): null | T => {
  const [state, setSnapshot]: [null | T, (state: T) => void] = useState(null);
  useViewportEffect(
    (viewport: IViewport, snapshot: T) => setSnapshot(snapshot),
    {
      ...options,
      recalculateLayoutBeforeUpdate,
    },
  );
  return state;
};
