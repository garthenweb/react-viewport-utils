import { useContext, useEffect, useLayoutEffect, useState } from 'react';

import { ViewportContext } from './ViewportProvider';
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

type HandleViewportChangeType = (options: {
  viewport: IViewport;
  snapshot: any;
}) => void;

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

  useEffect(() => {
    const handler = (viewport: IViewport, snapshot: any) =>
      handleViewportChange({ viewport, snapshot });
    addViewportChangeListener(handler, {
      notifyScroll: () => !options.disableScrollUpdates,
      notifyDimensions: () => !options.disableDimensionsUpdates,
      notifyOnlyWhenIdle: () => Boolean(options.deferUpdateUntilIdle),
      priority: () => options.priority || 'normal',
      recalculateLayoutBeforeUpdate: options.recalculateLayoutBeforeUpdate,
    });
    return () => removeViewportChangeListener(handler);
  }, [addViewportChangeListener, removeViewportChangeListener]);
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
  const { getCurrentViewport } = useContext(ViewportContext);
  const [state, setViewport] = useState(getCurrentViewport());
  useViewportEffect(({ viewport }) => setViewport(viewport), options);

  return state;
};

export const useLayoutSnapshot = <T = any>(
  recalculateLayoutBeforeUpdate: (viewport: IViewport) => T,
  options: IFullOptions = {},
): null | T => {
  const { getCurrentViewport } = useContext(ViewportContext);
  const [state, setSnapshot] = useState<null | T>(null);
  useViewportEffect(({ snapshot }: { snapshot: T }) => setSnapshot(snapshot), {
    ...options,
    recalculateLayoutBeforeUpdate,
  });

  useLayoutEffect(() => {
    setSnapshot(recalculateLayoutBeforeUpdate(getCurrentViewport()));
  }, []);

  return state;
};
