import {
  useContext,
  useEffect,
  useState,
  RefObject,
  useRef,
  DependencyList,
} from 'react';

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

export function useViewportEffect<T = unknown>(
  handleViewportChange: (viewport: IViewport, snapshot: T) => void,
  deps?: DependencyList,
): void;

export function useViewportEffect<T = unknown>(
  handleViewportChange: (viewport: IViewport, snapshot: T) => void,
  options?: IViewPortEffectOptions<T>,
  deps?: DependencyList,
): void;

export function useViewportEffect<T>(
  handleViewportChange: (viewport: IViewport, snapshot: T) => void,
  second?: any,
  third?: any,
) {
  const {
    addViewportChangeListener,
    removeViewportChangeListener,
    hasRootProviderAsParent,
  } = useContext(ViewportContext);
  const { options, deps } = sortArgs(second, third);
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
  }, [
    addViewportChangeListener || null,
    removeViewportChangeListener || null,
    ...deps,
  ]);
}

export const useViewport = (options: IFullOptions = {}): IViewport => {
  const { getCurrentViewport } = useContext(ViewportContext);
  const [state, setViewport] = useState(getCurrentViewport());
  useViewportEffect(viewport => setViewport(viewport), options);

  return state;
};

export function useScrollEffect<T = unknown>(
  effect: (scroll: IScroll, snapshot: T) => void,
  deps?: DependencyList,
): void;

export function useScrollEffect<T = unknown>(
  effect: (scroll: IScroll, snapshot: T) => void,
  options: IEffectOptions<T>,
  deps?: DependencyList,
): void;

export function useScrollEffect<T = unknown>(
  effect: (scroll: IScroll, snapshot: T) => void,
  second?: any,
  third?: any,
) {
  const { options, deps } = sortArgs(second, third);
  useViewportEffect(
    (viewport, snapshot: T) => effect(viewport.scroll, snapshot),
    {
      disableDimensionsUpdates: true,
      ...options,
    },
    deps,
  );
}

export const useScroll = (options: IOptions = {}): IScroll => {
  const { scroll } = useViewport({
    disableDimensionsUpdates: true,
    ...options,
  });

  return scroll;
};

export function useDimensionsEffect<T = unknown>(
  effect: (dimensions: IDimensions, snapshot: T) => void,
  deps?: DependencyList,
): void;

export function useDimensionsEffect<T = unknown>(
  effect: (dimensions: IDimensions, snapshot: T) => void,
  options: IEffectOptions<T>,
  deps?: DependencyList,
): void;

export function useDimensionsEffect<T = unknown>(
  effect: (dimensions: IDimensions, snapshot: T) => void,
  second: any,
  third?: any,
) {
  const { options, deps } = sortArgs(second, third);
  useViewportEffect(
    (viewport, snapshot: T) => effect(viewport.dimensions, snapshot),
    {
      disableScrollUpdates: true,
      ...options,
    },
    deps,
  );
}

export const useDimensions = (options: IOptions = {}): IDimensions => {
  const { dimensions } = useViewport({
    disableScrollUpdates: true,
    ...options,
  });

  return dimensions;
};

export function useRectEffect(
  effect: (rect: IRect | null) => void,
  ref: RefObject<HTMLElement>,
  deps?: DependencyList,
): void;

export function useRectEffect(
  effect: (rect: IRect | null) => void,
  ref: RefObject<HTMLElement>,
  options: IFullOptions,
  deps?: DependencyList,
): void;

export function useRectEffect(
  effect: (rect: IRect | null) => void,
  ref: RefObject<HTMLElement>,
  third?: any,
  fourth?: any,
) {
  const { options, deps } = sortArgs(third, fourth);
  useViewportEffect(
    (_, snapshot) => effect(snapshot),
    {
      ...options,
      recalculateLayoutBeforeUpdate: () =>
        ref.current ? ref.current.getBoundingClientRect() : null,
    },
    [ref.current, ...deps],
  );
}

export function useRect(
  ref: RefObject<HTMLElement>,
  deps?: DependencyList,
): void;

export function useRect(
  ref: RefObject<HTMLElement>,
  options: IFullOptions,
  deps?: DependencyList,
): void;

export function useRect(
  ref: RefObject<HTMLElement>,
  second: any,
  third?: any,
): IRect | null {
  const { options, deps } = sortArgs(second, third);
  return useLayoutSnapshot(
    () => (ref.current ? ref.current.getBoundingClientRect() : null),
    options,
    [ref.current, ...deps],
  );
}

export function useLayoutSnapshot<T = unknown>(
  recalculateLayoutBeforeUpdate: (viewport: IViewport) => T,
  deps?: DependencyList,
): null | T;

export function useLayoutSnapshot<T = unknown>(
  recalculateLayoutBeforeUpdate: (viewport: IViewport) => T,
  options?: IFullOptions,
  deps?: DependencyList,
): null | T;

export function useLayoutSnapshot<T = unknown>(
  recalculateLayoutBeforeUpdate: (viewport: IViewport) => T,
  second?: any,
  third?: any,
): null | T {
  const { options, deps } = sortArgs(second, third);
  const [state, setSnapshot] = useState<null | T>(null);
  useViewportEffect(
    (_, snapshot: T) => setSnapshot(snapshot),
    {
      ...options,
      recalculateLayoutBeforeUpdate,
    },
    deps,
  );

  return state;
}

const useOptions = <T>(o: IViewPortEffectOptions<T>) => {
  const optionsRef = useRef<IViewPortEffectOptions<T>>(Object.create(null));
  for (const key of Object.keys(optionsRef.current)) {
    delete optionsRef.current[key];
  }
  Object.assign(optionsRef.current, o);

  return optionsRef.current;
};

const sortArgs = (
  first: DependencyList | IOptions,
  second?: DependencyList,
) => {
  let options = {};
  if (first && !Array.isArray(first)) {
    options = first;
  }
  let deps = second || [];
  if (first && Array.isArray(first)) {
    deps = first;
  }
  return { deps, options };
};
