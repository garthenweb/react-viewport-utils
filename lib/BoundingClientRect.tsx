import * as React from 'react';
import raf from 'raf';

interface IProps {
  children: (rect: IState) => React.ReactNode;
  node: React.RefObject<HTMLElement>;
  setInitials?: (rect: IState) => void;
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
  private firstSync: boolean = true;

  constructor(props) {
    super(props);
    this.state = null;
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
    if (!node || !node.current) {
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

    if (this.firstSync && this.props.setInitials) {
      this.props.setInitials({ height, width, top, bottom, left, right });
      this.firstSync = false;
    }

    this.setState({ height, width, top, bottom, left, right });
  };

  render() {
    const { children } = this.props;
    return children(this.state);
  }
}
