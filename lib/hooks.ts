import { useContext, useEffect, useState, RefObject, useRef } from 'react';

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
  [key: string]: unknown;
  deferUpdateUntilIdle?: boolean;
  priority?: PriorityType;
}
interface IEffectOptions<T> extends IOptions {
  recalculateLayoutBeforeUpdate?: (viewport: IViewport) => T;
}

const useOptions = <T>(o: IViewPortEffectOptions<T>) => {
  const optionsRef = useRef<IViewPortEffectOptions<T>>(Object.create(null));
  for (const key of Object.keys(optionsRef.current)) {
    delete optionsRef.current[key];
  }
  Object.assign(optionsRef.current, o);

  return optionsRef.current;
};

export const useViewportEffect = <T>(
  handleViewportChange: (viewport: IViewport, snapshot: T) => void,
  options: IViewPortEffectOptions<T> = {},
) => {
  const {
    addViewportChangeListener,
    removeViewportChangeListener,
    hasRootProviderAsParent,
  } = useContext(ViewportContext);
  const memoOptions = useOptions(options);

  useEffect(() => {
    if (!hasRootProviderAsParent) {
      warnNoContextAvailable('useViewport');
      return;
    }
    addViewportChangeListener(handleViewportChange, {
      notifyScroll: () => !memoOptions.disableScrollUpdates,
      notifyDimensions: () => !memoOptions.disableDimensionsUpdates,
      notifyOnlyWhenIdle: () => Boolean(memoOptions.deferUpdateUntilIdle),
      priority: () => memoOptions.priority || 'normal',
      recalculateLayoutBeforeUpdate: memoOptions.recalculateLayoutBeforeUpdate,
    });
    return () => removeViewportChangeListener(handleViewportChange);
  }, [addViewportChangeListener || null, removeViewportChangeListener || null]);
};

export const useViewport = (options: IFullOptions = {}): IViewport => {
  const { getCurrentViewport } = useContext(ViewportContext);
  const [state, setViewport] = useState(getCurrentViewport());
  useViewportEffect(viewport => setViewport(viewport), options);

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

export const useDimensionsEffect = <T = unknown>(
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

export const useLayoutSnapshot = <T = unknown>(
  recalculateLayoutBeforeUpdate: (viewport: IViewport) => T,
  options: IFullOptions = {},
): null | T => {
  const [state, setSnapshot] = useState<null | T>(null);
  useViewportEffect((_, snapshot: T) => setSnapshot(snapshot), {
    ...options,
    recalculateLayoutBeforeUpdate,
  });

  return state;
};
