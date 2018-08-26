import * as React from 'react';

const StickyGroupContext = React.createContext({
  stickyOffset: 0,
  updateStickyOffset: (offset: number) => {},
});

export const connect = () => WrappedComponent => props => {
  return (
    <StickyGroupContext.Consumer>
      {context => (
        <WrappedComponent
          {...props}
          stickyOffset={context.stickyOffset}
          updateStickyOffset={context.updateStickyOffset}
        />
      )}
    </StickyGroupContext.Consumer>
  );
};

interface IState {
  stickyOffset: number;
}

export default class StickyGroupProvider extends React.PureComponent<
  {},
  IState
> {
  constructor(props) {
    super(props);
    this.state = {
      stickyOffset: 0,
    };
  }

  updateStickyOffset = stickyOffset => {
    this.setState({
      stickyOffset,
    });
  };

  render() {
    return (
      <StickyGroupContext.Provider
        value={{
          updateStickyOffset: this.updateStickyOffset,
          stickyOffset: this.state.stickyOffset,
        }}
      >
        {this.props.children}
      </StickyGroupContext.Provider>
    );
  }
}
