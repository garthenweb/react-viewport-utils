import { IRect, IScroll, IPrivateScroll, IDimensions } from './types';

export const shallowEqualScroll = (a: IScroll, b: IScroll) => {
  if (a === b) {
    return true;
  }
  return (
    a.x === b.x &&
    a.y === b.y &&
    a.xTurn === b.xTurn &&
    a.yTurn === b.yTurn &&
    a.xDTurn === b.xDTurn &&
    a.yDTurn === b.yDTurn &&
    a.isScrollingUp === b.isScrollingUp &&
    a.isScrollingDown === b.isScrollingDown &&
    a.isScrollingLeft === b.isScrollingLeft &&
    a.isScrollingRight === b.isScrollingRight
  );
};

export const shallowEqualPrivateScroll = (
  a: IPrivateScroll,
  b: IPrivateScroll,
) => {
  if (a === b) {
    return true;
  }
  return (
    a.x === b.x &&
    a.y === b.y &&
    a.xTurn === b.xTurn &&
    a.yTurn === b.yTurn &&
    a.xDTurn === b.xDTurn &&
    a.yDTurn === b.yDTurn &&
    a.xDir === b.xDir &&
    a.yDir === b.yDir
  );
};

export const shallowEqualRect = (a: IRect, b: IRect) => {
  if (a === b) {
    return true;
  }

  return (
    a.top === b.top &&
    a.right === b.right &&
    a.bottom === b.bottom &&
    a.left === b.left &&
    a.height === b.height &&
    a.width === b.width
  );
};

export const shallowEqualDimensions = (a: IDimensions, b: IDimensions) => {
  if (a === b) {
    return true;
  }

  return a.width === b.width && a.height === b.height;
};
