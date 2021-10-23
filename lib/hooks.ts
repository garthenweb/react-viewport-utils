import {
  useContext,
  useEffect,
  useState,
  RefObject,
  MutableRefObject,
  useRef,
  DependencyList,
} from 'react';

import { ViewportContext } from './ViewportProvider';
import { Viewport, Scroll, Dimensions, PriorityType, Rect } from './types';
import { warnNoContextAvailable } from './utils';

interface ViewPortEffectOptions<T> extends FullOptions {
  recalculateLayoutBeforeUpdate?: (viewport: Viewport) => T;
}

interface FullOptions extends IOptions {
  disableScrollUpdates?: boolean;
  disableDimensionsUpdates?: boolean;
}

interface IOptions {
  [key: string]: unknown;
  deferUpdateUntilIdle?: boolean;
  priority?: PriorityType;
}
interface IEffectOptions<T> extends IOptions {
  recalculateLayoutBeforeUpdate?: (viewport: Viewport) => T;
}

export function useViewportEffect<T = unknown>(
  handleViewportChange: (viewport: Viewport, snapshot: T) => void,
  deps?: DependencyList,
): void;

export function useViewportEffect<T = unknown>(
  handleViewportChange: (viewport: Viewport, snapshot: T) => void,
  options?: ViewPortEffectOptions<T>,
  deps?: DependencyList,
): void;

export function useViewportEffect<T>(
  handleViewportChange: (viewport: Viewport, snapshot: T) => void,
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
      recalculateLayoutBeforeUpdate: (...args) =>
        memoOptions.recalculateLayoutBeforeUpdate
          ? memoOptions.recalculateLayoutBeforeUpdate(...args)
          : null,
    });
    return () => removeViewportChangeListener(handleViewportChange);
  }, [
    addViewportChangeListener || null,
    removeViewportChangeListener || null,
    ...deps,
  ]);
}

export const useViewport = (options: FullOptions = {}): Viewport => {
  const { getCurrentViewport } = useContext(ViewportContext);
  const [state, setViewport] = useState(getCurrentViewport());
  useViewportEffect((viewport) => setViewport(viewport), options);

  return state;
};

export function useScrollEffect<T = unknown>(
  effect: (scroll: Scroll, snapshot: T) => void,
  deps?: DependencyList,
): void;

export function useScrollEffect<T = unknown>(
  effect: (scroll: Scroll, snapshot: T) => void,
  options: IEffectOptions<T>,
  deps?: DependencyList,
): void;

export function useScrollEffect<T = unknown>(
  effect: (scroll: Scroll, snapshot: T) => void,
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

export const useScroll = (options: IOptions = {}): Scroll => {
  const { scroll } = useViewport({
    disableDimensionsUpdates: true,
    ...options,
  });

  return scroll;
};

export function useDimensionsEffect<T = unknown>(
  effect: (dimensions: Dimensions, snapshot: T) => void,
  deps?: DependencyList,
): void;

export function useDimensionsEffect<T = unknown>(
  effect: (dimensions: Dimensions, snapshot: T) => void,
  options: IEffectOptions<T>,
  deps?: DependencyList,
): void;

export function useDimensionsEffect<T = unknown>(
  effect: (dimensions: Dimensions, snapshot: T) => void,
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

export const useDimensions = (options: IOptions = {}): Dimensions => {
  const { dimensions } = useViewport({
    disableScrollUpdates: true,
    ...options,
  });

  return dimensions;
};

export function useRectEffect<T extends HTMLElement>(
  effect: (rect: Rect | null) => void,
  ref: RefObject<T> | MutableRefObject<T>,
  deps?: DependencyList,
): void;

export function useRectEffect<T extends HTMLElement>(
  effect: (rect: Rect | null) => void,
  ref: RefObject<T> | MutableRefObject<T>,
  options: FullOptions,
  deps?: DependencyList,
): void;

export function useRectEffect<T extends HTMLElement>(
  effect: (rect: Rect | null) => void,
  ref: RefObject<T> | MutableRefObject<T>,
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

export function useRect<T extends HTMLElement>(
  ref: RefObject<T> | MutableRefObject<T>,
  deps?: DependencyList,
): Rect | null;

export function useRect<T extends HTMLElement>(
  ref: RefObject<T> | MutableRefObject<T>,
  options: FullOptions,
  deps?: DependencyList,
): Rect | null;

export function useRect<T extends HTMLElement>(
  ref: RefObject<T> | MutableRefObject<T>,
  second: any,
  third?: any,
): Rect | null {
  const { options, deps } = sortArgs(second, third);
  return useLayoutSnapshot(
    () => (ref.current ? ref.current.getBoundingClientRect() : null),
    options,
    [ref.current, ...deps],
  );
}

export function useLayoutSnapshot<T = unknown>(
  recalculateLayoutBeforeUpdate: (viewport: Viewport) => T,
  deps?: DependencyList,
): null | T;

export function useLayoutSnapshot<T = unknown>(
  recalculateLayoutBeforeUpdate: (viewport: Viewport) => T,
  options?: FullOptions,
  deps?: DependencyList,
): null | T;

export function useLayoutSnapshot<T = unknown>(
  recalculateLayoutBeforeUpdate: (viewport: Viewport) => T,
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

const useOptions = <T>(o: ViewPortEffectOptions<T>) => {
  const optionsRef = useRef<ViewPortEffectOptions<T>>(Object.create(null));
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

/**
 * Exposes the current viewport state as a mutable and readonly object. It will not trigger updates when the value on the viewport change but allows to access the current and most up to date information at any time without any negative performance impact.
 */
export const useMutableViewport = () => {
  return useContext(ViewportContext).getMutableViewportState();
};
