import { useContext, useEffect, useState } from 'react';

import { ViewportContext } from './ViewportProvider';
import {
  createInitScrollState,
  createInitDimensionsState,
} from './ViewportCollector';
import { IViewport, IScroll, IDimensions, PriorityType } from './types';
import { warnNoContextAvailable } from './utils';

interface IFullOptions extends IOptions {
  disableScrollUpdates?: boolean;
  disableDimensionsUpdates?: boolean;
}

interface IOptions {
  deferUpdateUntilIdle?: boolean;
  priority?: PriorityType;
}

type HandleViewportChangeType = (viewport: IViewport) => void;

const useViewportEffect = (
  handleViewportChange: HandleViewportChangeType,
  options: IFullOptions,
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
    viewport: createInitDimensionsState(),
  });
  useViewportEffect(setViewport, options);

  return state;
};
