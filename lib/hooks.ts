import { useContext, useEffect, useState, RefObject } from 'react';

import { ViewportContext } from './ViewportProvider';
import { IViewport, IScroll, IDimensions, PriorityType, IRect } from './types';
import { warnNoContextAvailable } from './utils';

interface IViewPortEffectOptions<T> extends IFullOptions {
  recalculateLayoutBeforeUpdate?: (viewport: IViewport) => T;
}

interface IFullOptions extends IOptions {
  disableScrollUpdates?: boolean;
  disableDimensionsUpdates?: boolean;
}

interface IOptions {
  deferUpdateUntilIdle?: boolean;
  priority?: PriorityType;
}
interface IEffectOptions<T> extends IOptions {
  recalculateLayoutBeforeUpdate?: (viewport: IViewport) => T;
}

type HandleViewportChangeType = (viewport: IViewport, snapshot: any) => void;

export const useViewportEffect = <T = any>(
  handleViewportChange: HandleViewportChangeType,
  options: IViewPortEffectOptions<T> = {},
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
    addViewportChangeListener(handleViewportChange, {
      notifyScroll: () => !options.disableScrollUpdates,
      notifyDimensions: () => !options.disableDimensionsUpdates,
      notifyOnlyWhenIdle: () => Boolean(options.deferUpdateUntilIdle),
      priority: () => options.priority || 'normal',
      recalculateLayoutBeforeUpdate: options.recalculateLayoutBeforeUpdate,
    });
    return () => removeViewportChangeListener(handleViewportChange);
  }, [addViewportChangeListener, removeViewportChangeListener]);
};

export const useViewport = (options: IFullOptions = {}): IViewport => {
  const { getCurrentViewport } = useContext(ViewportContext);
  const [state, setViewport] = useState(getCurrentViewport());
  useViewportEffect(viewport => setViewport(viewport), options);

  return state;
};

export const useScrollEffect = <T = any>(
  effect: (scroll: IScroll, snapshot: T) => void,
  options: IEffectOptions<T> = {},
) => {
  useViewportEffect(
    (viewport, snapshot: T) => effect(viewport.scroll, snapshot),
    {
      disableDimensionsUpdates: true,
      ...options,
    },
  );
};

export const useScroll = (options: IOptions = {}): IScroll => {
  const { scroll } = useViewport({
    disableDimensionsUpdates: true,
    ...options,
  });

  return scroll;
};

export const useDimensionsEffect = <T = any>(
  effect: (scroll: IDimensions, snapshot: T) => void,
  options: IEffectOptions<T> = {},
) => {
  useViewportEffect(
    (viewport, snapshot: T) => effect(viewport.dimensions, snapshot),
    {
      disableScrollUpdates: true,
      ...options,
    },
  );
};

export const useDimensions = (options: IOptions = {}): IDimensions => {
  const { dimensions } = useViewport({
    disableScrollUpdates: true,
    ...options,
  });

  return dimensions;
};

export const useRectEffect = (
  effect: (rect: IRect | null) => void,
  ref: RefObject<HTMLElement>,
  options?: IFullOptions,
) => {
  useViewportEffect((_, snapshot) => effect(snapshot), {
    ...options,
    recalculateLayoutBeforeUpdate: () =>
      ref.current ? ref.current.getBoundingClientRect() : null,
  });
};

export const useRect = (
  ref: RefObject<HTMLElement>,
  options?: IFullOptions,
): IRect | null => {
  return useLayoutSnapshot(
    () => (ref.current ? ref.current.getBoundingClientRect() : null),
    options,
  );
};

export const useLayoutSnapshot = <T = any>(
  recalculateLayoutBeforeUpdate: (viewport: IViewport) => T,
  options: IFullOptions = {},
): null | T => {
  const { getCurrentViewport } = useContext(ViewportContext);
  const [state, setSnapshot] = useState<null | T>(null);
  useViewportEffect((_, snapshot: T) => setSnapshot(snapshot), {
    ...options,
    recalculateLayoutBeforeUpdate,
  });

  useEffect(() => {
    setSnapshot(recalculateLayoutBeforeUpdate(getCurrentViewport()));
  }, []);

  return state;
};
