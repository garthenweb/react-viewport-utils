import * as React from 'react';
const raf = require('raf');

interface IProps {
  children: (rect: IRect | null) => React.ReactNode;
  node: React.RefObject<HTMLElement>;
  setInitials?: (rect: IRect) => void;
}

interface IRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
  height: number;
  width: number;
}

export default class BoundingClientRect extends React.PureComponent<
  IProps,
  IRect | null
> {
  private tickId: NodeJS.Timer;
  private firstSync: boolean = true;

  constructor(props: IProps) {
    super(props);
    this.state = null;
  }

  componentDidMount() {
    this.tick(this.syncState);
  }

  componentWillUnmount() {
    raf.cancel(this.tickId);
  }

  tick(updater: Function) {
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
