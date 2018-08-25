import * as React from 'react';
import raf from 'raf';
import shallowEqual from 'shallowequal';

import { Consumer, createInitScrollState, IScroll } from './Provider';

export default function connectScroll() {
  return WrappedComponent =>
    class ConnectScroll extends React.PureComponent<{}, { scroll: IScroll }> {
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
        return (
          <React.Fragment>
            <Consumer>{this.storeContext}</Consumer>
            <WrappedComponent {...this.props} scroll={this.state.scroll} />
          </React.Fragment>
        );
      }
    };
}
