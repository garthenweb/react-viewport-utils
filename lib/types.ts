export interface IDimensions {
  width: number;
  height: number;
  clientWidth: number;
  clientHeight: number;
  outerWidth: number;
  outerHeight: number;
  documentWidth: number;
  documentHeight: number;
}

export interface IScroll {
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

export interface IRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
  height: number;
  width: number;
}

export interface IViewport {
  scroll: IScroll;
  dimensions: IDimensions;
}

export type TViewportChangeHandler = (
  viewport: IViewport,
  layoutSnapshot: any,
) => void;

export interface IViewportChangeOptions {
  notifyScroll: () => boolean;
  notifyDimensions: () => boolean;
  notifyOnlyWhenIdle: () => boolean;
  recalculateLayoutBeforeUpdate?: (viewport: IViewport) => any;
}

export interface IViewportCollectorUpdateOptions {
  scrollDidUpdate: boolean;
  dimensionsDidUpdate: boolean;
}

export type OnUpdateType = (
  props: IViewport,
  options: IViewportCollectorUpdateOptions,
) => void;
