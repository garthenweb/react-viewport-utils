import * as React from 'react';
import raf from 'raf';

interface IProps {
  children: (rect: IState) => React.ReactNode;
  node: React.RefObject<HTMLElement>;
}

interface IState {
  top: number;
  right: number;
  bottom: number;
  left: number;
  height: number;
  width: number;
}

export default class BoundingClientRect extends React.PureComponent<
  IProps,
  IState
> {
  private tickId: NodeJS.Timer;

  constructor(props) {
    super(props);
    this.state = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      height: 0,
      width: 0,
    };
  }

  componentDidMount() {
    this.tick(this.syncState);
  }

  componentWillUnmount() {
    raf.cancel(this.tickId);
  }

  tick(updater) {
    this.tickId = raf(() => {
      updater();
      this.tick(updater);
    });
  }

  syncState = () => {
    const { node } = this.props;
    if (!node.current) {
      return;
    }
    const {
      height,
      width,
      top,
      bottom,
      left,
      right,
    } = node.current.getBoundingClientRect();
    this.setState({ height, width, top, bottom, left, right });
  };

  render() {
    const { children } = this.props;
    return children(this.state);
  }
}
