import * as React from 'react';
const raf = require('raf');
const shallowEqual = require('shallowequal');

import {
  Consumer,
  createInitScrollState,
  IScroll as IState,
  SCROLL_DIR_UP,
  SCROLL_DIR_DOWN,
  SCROLL_DIR_RIGHT,
  SCROLL_DIR_LEFT,
} from './ViewportProvider';

interface IProps {}

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

export default function connectScroll() {
  return (WrappedComponent: React.ComponentType<any>) => {
    return class ConnectScroll extends React.PureComponent<IProps, IState> {
      tickId: NodeJS.Timer;
      scrollContext: IState;

      constructor(props: IProps) {
        super(props);
        this.scrollContext = createInitScrollState();
        this.state = createInitScrollState();
      }

      componentDidMount() {
        this.tick(this.syncState);
      }

      componentWillUnmount() {
        raf.cancel(this.tickId);
      }

      storeContext = (scrollContext: { scroll: IState }) => {
        this.scrollContext = scrollContext.scroll;
        return null;
      };

      tick(updater: Function) {
        this.tickId = raf(() => {
          updater();
          this.tick(updater);
        });
      }

      syncState = () => {
        if (!shallowEqual(this.scrollContext, this.state)) {
          this.setState({ ...this.scrollContext });
        }
      };

      render() {
        const { xDir, yDir, ...scroll } = this.state;
        return (
          <React.Fragment>
            <Consumer>{this.storeContext}</Consumer>
            <WrappedComponent
              {...this.props}
              scroll={{
                ...scroll,
                isScrollingUp: yDir === SCROLL_DIR_UP,
                isScrollingDown: yDir === SCROLL_DIR_DOWN,
                isScrollingLeft: xDir === SCROLL_DIR_LEFT,
                isScrollingRight: xDir === SCROLL_DIR_RIGHT,
              }}
            />
          </React.Fragment>
        );
      }
    };
  };
}
