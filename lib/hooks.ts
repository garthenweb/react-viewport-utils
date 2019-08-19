import { useContext, useEffect, useState, RefObject } from 'react';

import { ViewportContext } from './ViewportProvider';
import { IViewport, IScroll, IDimensions, PriorityType, IRect } from './types';
import { warnNoContextAvailable } from './utils';

export type HookType =
  | 'useScroll'
  | 'useScrollEffect'
  | 'useDimensions'
  | 'useDimensionsEffect'
  | 'useViewport'
  | 'useViewportEffect'
  | 'useLayoutSnapshot'
  | 'useRect'
  | 'useRectEffect';

interface IViewPortEffectOptions<T> extends IFullOptions {
  recalculateLayoutBeforeUpdate?: (viewport: IViewport) => T;
  type: HookType;
}

interface IFullOptions extends IOptions {
  disableScrollUpdates?: boolean;
  disableDimensionsUpdates?: boolean;
}

interface IOptions {
  deferUpdateUntilIdle?: boolean;
  priority?: PriorityType;
  displayName?: string;
}
interface IEffectOptions<T> extends IOptions {
  recalculateLayoutBeforeUpdate?: (viewport: IViewport) => T;
}

export const useViewportEffect = <T>(
  handleViewportChange: (viewport: IViewport, snapshot: T) => void,
  options?: IViewPortEffectOptions<T>,
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
      notifyScroll: () => !options || !options.disableScrollUpdates,
      notifyDimensions: () => !options || !options.disableDimensionsUpdates,
      notifyOnlyWhenIdle: () =>
        Boolean(options && options.deferUpdateUntilIdle),
      priority: () => (options && options.priority) || 'normal',
      recalculateLayoutBeforeUpdate:
        options && options.recalculateLayoutBeforeUpdate,
      displayName: () => options && options.displayName,
      type: (options && options.type) || 'useViewportEffect',
    });
    return () => removeViewportChangeListener(handleViewportChange);
  }, [addViewportChangeListener, removeViewportChangeListener]);
};

const usePrivateViewport = <T = unknown>(
  options: IViewPortEffectOptions<T>,
): IViewport => {
  const { getCurrentViewport } = useContext(ViewportContext);
  const [state, setViewport] = useState(getCurrentViewport());
  useViewportEffect(viewport => setViewport(viewport), options);

  return state;
};

const usePrivateLayoutSnapshot = <T = unknown>(
  recalculateLayoutBeforeUpdate: (viewport: IViewport) => T,
  options: IViewPortEffectOptions<T>,
): null | T => {
  const { getCurrentViewport } = useContext(ViewportContext);
  const [state, setSnapshot] = useState<null | T>(null);
  useViewportEffect((_, snapshot: T) => setSnapshot(snapshot), {
    type: 'useLayoutSnapshot',
    ...options,
    recalculateLayoutBeforeUpdate,
  });

  useEffect(() => {
    setSnapshot(recalculateLayoutBeforeUpdate(getCurrentViewport()));
  }, []);

  return state;
};

export const useScrollEffect = <T = unknown>(
  effect: (scroll: IScroll, snapshot: T) => void,
  options: IEffectOptions<T> = {},
) => {
  useViewportEffect(
    (viewport, snapshot: T) => effect(viewport.scroll, snapshot),
    {
      disableDimensionsUpdates: true,
      type: 'useScrollEffect',
      ...options,
    },
  );
};

export const useScroll = (options: IOptions = {}): IScroll => {
  const { scroll } = usePrivateViewport({
    disableDimensionsUpdates: true,
    type: 'useScroll',
    ...options,
  });

  return scroll;
};

export const useDimensionsEffect = <T = unknown>(
  effect: (scroll: IDimensions, snapshot: T) => void,
  options: IEffectOptions<T> = {},
) => {
  useViewportEffect(
    (viewport, snapshot: T) => effect(viewport.dimensions, snapshot),
    {
      disableScrollUpdates: true,
      type: 'useDimensionsEffect',
      ...options,
    },
  );
};

export const useDimensions = (options: IOptions = {}): IDimensions => {
  const { dimensions } = usePrivateViewport({
    disableScrollUpdates: true,
    type: 'useDimensions',
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
    type: 'useRectEffect',
    recalculateLayoutBeforeUpdate: () =>
      ref.current ? ref.current.getBoundingClientRect() : null,
  });
};

export const useRect = (
  ref: RefObject<HTMLElement>,
  options?: IFullOptions,
): IRect | null => {
  return usePrivateLayoutSnapshot(
    () => (ref.current ? ref.current.getBoundingClientRect() : null),
    {
      ...options,
      type: 'useRect',
    },
  );
};

export const useLayoutSnapshot = <T = unknown>(
  recalculateLayoutBeforeUpdate: (viewport: IViewport) => T,
  options: IFullOptions = {},
): null | T => {
  return usePrivateLayoutSnapshot(recalculateLayoutBeforeUpdate, {
    ...options,
    type: 'useLayoutSnapshot',
  });
};

export const useViewport = (options: IFullOptions = {}): IViewport => {
  return usePrivateViewport({
    ...options,
    type: 'useViewport',
  });
};
