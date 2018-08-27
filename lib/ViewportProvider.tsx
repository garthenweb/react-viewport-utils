import * as React from 'react';

export const SCROLL_DIR_DOWN = Symbol('SCROLL_DIR_DOWN');
export const SCROLL_DIR_UP = Symbol('SCROLL_DIR_UP');
export const SCROLL_DIR_LEFT = Symbol('SCROLL_DIR_LEFT');
export const SCROLL_DIR_RIGHT = Symbol('SCROLL_DIR_RIGHT');

export interface IScroll {
  x: number;
  y: number;
  xDir: typeof SCROLL_DIR_LEFT | typeof SCROLL_DIR_RIGHT | undefined;
  yDir: typeof SCROLL_DIR_UP | typeof SCROLL_DIR_DOWN | undefined;
  xTurn: number;
  yTurn: number;
  xDTurn: number;
  yDTurn: number;
}

const ViewportContext = React.createContext({
  scroll: { x: 0, y: 0 },
});

const getNodeScroll = (elem = window) => {
  let { scrollX, scrollY } = elem;
  if (scrollX === undefined) {
    scrollX = elem.pageXOffset;
  }
  if (scrollY === undefined) {
    scrollY = elem.pageYOffset;
  }

  return {
    x: scrollX,
    y: scrollY,
  };
};

const getXDir = (x: number, prev: IScroll) => {
  switch (true) {
    case x < prev.x:
      return SCROLL_DIR_LEFT;
    case x > prev.x:
      return SCROLL_DIR_RIGHT;
    case x === prev.x:
      return prev.xDir === SCROLL_DIR_LEFT ? SCROLL_DIR_RIGHT : SCROLL_DIR_LEFT;
    default:
      throw new Error('Could not calculate xDir');
  }
};

const getYDir = (y: number, prev: IScroll) => {
  switch (true) {
    case y < prev.y:
      return SCROLL_DIR_UP;
    case y > prev.y:
      return SCROLL_DIR_DOWN;
    case y === prev.y:
      return prev.yDir === SCROLL_DIR_UP ? SCROLL_DIR_DOWN : SCROLL_DIR_UP;
    default:
      throw new Error('Could not calculate yDir');
  }
};

export const createInitScrollState = () => ({
  x: 0,
  y: 0,
  xDir: undefined,
  yDir: undefined,
  xTurn: 0,
  yTurn: 0,
  xDTurn: 0,
  yDTurn: 0,
});

export const Consumer = ViewportContext.Consumer;
export default class ViewportProvider extends React.PureComponent {
  private scrollState: IScroll;

  constructor(props: any) {
    super(props);
    this.scrollState = createInitScrollState();
  }

  handleScroll = () => {
    const { x, y } = getNodeScroll();
    const {
      xDir: prevXDir,
      yDir: prevYDir,
      xTurn: prevXTurn,
      yTurn: prevYTurn,
    } = this.scrollState;

    this.scrollState.xDir = getXDir(x, this.scrollState);
    this.scrollState.yDir = getYDir(y, this.scrollState);

    this.scrollState.xTurn = this.scrollState.xDir === prevXDir ? prevXTurn : x;
    this.scrollState.yTurn = this.scrollState.yDir === prevYDir ? prevYTurn : y;

    this.scrollState.xDTurn = x - this.scrollState.xTurn;
    this.scrollState.yDTurn = y - this.scrollState.yTurn;

    this.scrollState.x = x;
    this.scrollState.y = y;
  };

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll, false);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll, false);
  }

  render() {
    return (
      <ViewportContext.Provider value={{ scroll: this.scrollState }}>
        {this.props.children}
      </ViewportContext.Provider>
    );
  }
}
