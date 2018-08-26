# React Viewport Utils

The goal of this project is to create a set of low level utility components for react to make working with the viewport (e.g scroll position or size of the page/ single elements) easy and performant by default.

See the example folder for more information about what you can build with it.

## Caution

This library is in early stages and may contain bugs. Please fill them in the [issues section](https://github.com/garthenweb/react-viewport-utils/issues).

Also the performance goal is probably not reached yet, even if there are good defaults already. Some functionalities are missing as well and breaking changes may occur.

## Installation/ requirements

Please note that `react` version 16.3 or higher is required for this library to work because it is using the context as well as references api.

```
npm install --save react-viewport-utils
```

## Usage

### ViewportProvider/ connectViewportScroll

The ViewportProvider will delegate global viewport information to a connected component. At the moment only scroll events are supported.

``` javascript
import * as React from 'react';
import { ViewportProvider, connectViewportScroll } from 'react-viewport-uitls';

interface IScroll {
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

const Component = ({ scroll }: { scroll: IScroll }) => (
  <>
    <div>Scroll X: {scroll.x}</div>
    <div>Scroll Y: {scroll.y}</div>
    <div>Scroll last turning point X: {scroll.xTurn}</div>
    <div>Scroll last turning point Y: {scroll.yTurn}</div>
    <div>Difference from last turning point X: {scroll.xDTurn}</div>
    <div>Difference from last turning point Y: {scroll.yDTurn}</div>
    <div>Is scrolling up: ${scroll.isScrollingUp}</div>
    <div>Is scrolling down: ${scroll.isScrollingDown}</div>
    <div>Is scrolling left: ${scroll.isScrollingLeft}</div>
    <div>Is scrolling right: ${scroll.isScrollingRight}</div>
  </>
);
const ConnectedComponent = connectViewportScroll()(Component);

render(
  <ViewportProvider>
    <div>
      <ConnectedComponent />
    </div>
  </ViewportProvider>,
  document.querySelector('main')
);
```

### ObserveBoundingClientRect

Observes for changes to the bounding client rect of a given reference.

``` javascript
import * as React from 'react';
import { ObserveBoundingClientRect } from 'react-viewport-uitls';

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.state = {};
  }

  setInitials = rect => {
    this.setState(rect)
  }

  render() {
    return (
      <ObserveBoundingClientRect
        node={this.ref}
        setInitials={this.setInitials}
      >
        {rect => (
          <div ref={this.ref}>
            {Boolean(rect) && (
              <div>Current top: {rect.top}</div>
              <div>Current right: {rect.right}</div>
              <div>Current bottom: {rect.bottom}</div>
              <div>Current left: {rect.left}</div>
              <div>Current height: {rect.height}</div>
              <div>Current width: {rect.width}</div>
              <div>Initial top: {this.state.top}</div>
              <div>Initial right: {this.state.right}</div>
              <div>Initial bottom: {this.state.bottom}</div>
              <div>Initial left: {this.state.left}</div>
              <div>Initial height: {this.state.height}</div>
              <div>Initial width: {this.state.width}</div>
            )}
          </div>
        )}
      </ObserveBoundingClientRect>
    );
  }
}

render(
  <Component />,
  document.querySelector('main')
);
```

## License

Licensed under the [MIT License](https://opensource.org/licenses/mit-license.php).
