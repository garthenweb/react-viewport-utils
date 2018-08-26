import * as React from 'react';
import raf from 'raf';
import shallowEqual from 'shallowequal';

import {
  Consumer,
  createInitScrollState,
  IScroll as IScrollState,
  SCROLL_DIR_UP,
  SCROLL_DIR_DOWN,
  SCROLL_DIR_RIGHT,
  SCROLL_DIR_LEFT,
} from './Provider';

interface IProps {}

interface IState {
  scroll: IScrollState;
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

export default function connectScroll() {
  return WrappedComponent => {
    return class ConnectScroll extends React.PureComponent<IProps, IState> {
      tickId: NodeJS.Timer;

      constructor(props) {
        super(props);
        this.context = {
          scroll: createInitScrollState(),
        };
        this.state = {
          scroll: createInitScrollState(),
        };
      }

      componentDidMount() {
        this.tick(this.syncState);
      }

      componentWillUnmount() {
        raf.cancel(this.tickId);
      }

      storeContext = context => {
        this.context = context;
        return null;
      };

      tick(updater) {
        this.tickId = raf(() => {
          updater();
          this.tick(updater);
        });
      }

      syncState = () => {
        if (!shallowEqual(this.context.scroll, this.state.scroll)) {
          this.setState({
            scroll: { ...this.context.scroll },
          });
        }
      };

      render() {
        const { xDir, yDir, ...scroll } = this.state.scroll;
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
