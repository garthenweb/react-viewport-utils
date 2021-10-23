export interface Dimensions {
  width: number;
  height: number;
  clientWidth: number;
  clientHeight: number;
  outerWidth: number;
  outerHeight: number;
  documentWidth: number;
  documentHeight: number;
}

export interface Scroll {
  x: number;
  y: number;
  xTurn: number;
  yTurn: number;
  xDTurn: number;
  yDTurn: number;
  isScrollingUp: boolean;
  isScrollingDown: boolean;
  isScrollingLeft: boolean;
  isScrollingRight: boolean;
}

export interface Rect {
  top: number;
  right: number;
  bottom: number;
  left: number;
  height: number;
  width: number;
}

/**
 * @deprecated Better use Dimensions
 */
export interface IDimensions extends Dimensions {}
/**
 * @deprecated Better use Scroll
 */
export interface IScroll extends Scroll {}
/**
 * @deprecated Better use Rect
 */
export interface IRect extends Rect {}

export interface Viewport {
  scroll: Scroll;
  dimensions: Dimensions;
}

export type ViewportChangeHandler = (
  viewport: Viewport,
  layoutSnapshot: any,
) => void;

export interface ViewportChangeOptions {
  notifyScroll: () => boolean;
  notifyDimensions: () => boolean;
  notifyOnlyWhenIdle: () => boolean;
  priority: () => PriorityType;
  recalculateLayoutBeforeUpdate?: (viewport: Viewport) => unknown;
}

export interface ViewportCollectorUpdateOptions {
  scrollDidUpdate: boolean;
  dimensionsDidUpdate: boolean;
}

export type OnUpdateType = (
  props: Viewport,
  options: ViewportCollectorUpdateOptions,
) => void;

export type PriorityType = 'highest' | 'high' | 'normal' | 'low';
