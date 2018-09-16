import {
  SCROLL_DIR_LEFT,
  SCROLL_DIR_RIGHT,
  SCROLL_DIR_UP,
  SCROLL_DIR_DOWN,
} from './ViewportProvider';

export interface IDimensions {
  width: number;
  height: number;
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

export interface IPrivateScroll {
  x: number;
  y: number;
  xDir: typeof SCROLL_DIR_LEFT | typeof SCROLL_DIR_RIGHT | undefined;
  yDir: typeof SCROLL_DIR_UP | typeof SCROLL_DIR_DOWN | undefined;
  xTurn: number;
  yTurn: number;
  xDTurn: number;
  yDTurn: number;
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

export type TViewportChangeHandler = ({ scroll, dimensions }: IViewport) => void;
