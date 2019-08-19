import { Bridge } from '../dev-tools/lib/index';
declare module '@testing-library/react';

// @see https://gist.github.com/strothj/708afcf4f01dd04de8f49c92e88093c3
declare global {
  interface Window {
    ResizeObserver: ResizeObserver;
    requestIdleCallback: (
      callback: (deadline: RequestIdleCallbackDeadline) => void,
      opts?: RequestIdleCallbackOptions,
    ) => RequestIdleCallbackHandle;
    cancelIdleCallback: (handle: RequestIdleCallbackHandle) => void;
    __REACT_VIEWPORT_UTILS_BRIDGE__?: Bridge;
  }
}

/**
 * The ResizeObserver interface is used to observe changes to Element's content
 * rect.
 *
 * It is modeled after MutationObserver and IntersectionObserver.
 */
interface ResizeObserver {
  new (callback: ResizeObserverCallback): ResizeObserver;

  /**
   * Adds target to the list of observed elements.
   */
  observe: (target: Element) => void;

  /**
   * Removes target from the list of observed elements.
   */
  unobserve: (target: Element) => void;

  /**
   * Clears both the observationTargets and activeTargets lists.
   */
  disconnect: () => void;
}

/**
 * This callback delivers ResizeObserver's notifications. It is invoked by a
 * broadcast active observations algorithm.
 */
interface ResizeObserverCallback {
  (entries: ResizeObserverEntry[], observer: ResizeObserver): void;
}

interface ResizeObserverEntry {
  /**
   * @param target The Element whose size has changed.
   */
  new (target: Element): ResizeObserverEntry;

  /**
   * The Element whose size has changed.
   */
  readonly target: Element;

  /**
   * Element's content rect when ResizeObserverCallback is invoked.
   */
  readonly contentRect: DOMRectReadOnly;
}

interface DOMRectReadOnly {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;

  toJSON: () => any;
}

type RequestIdleCallbackHandle = any;
type RequestIdleCallbackOptions = {
  timeout: number;
};
type RequestIdleCallbackDeadline = {
  readonly didTimeout: boolean;
  timeRemaining: () => number;
};
