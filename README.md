# React Viewport Utils

The goal of this project is to create a set of low level utility components for react to make working with the viewport (e.g scroll position or size of the page/ single elements) easy and performant by default.

See the example folder for more information about what you can build with it.

## Installation/ requirements

Please note that `react` version 16.3 or higher is required for this library to work because it is using the [context](https://reactjs.org/docs/context.html) as well as [references](https://reactjs.org/docs/refs-and-the-dom.html) api.

```
npm install --save react-viewport-utils
```

By default the library ships with Typescript definitions, so there is no need to install a separate dependency. Typescript is no requirement for this library, all definition are extracted in separate files.

## Usage

### ViewportProvider/ connectViewportScroll

The ViewportProvider will delegate global viewport information to a connected component.

``` javascript
import * as React from 'react';
import {
  ViewportProvider,
  connectViewport,
  IScroll,
  IDimensions,
} from 'react-viewport-uitls';

interface IProps {
  scroll: IScroll,
  dimensions: IDimensions,
}

const Component = ({ scroll, dimensions }: IProps) => (
  <>
    <div>Dimension width: ${dimensions.width}</div>
    <div>Dimension height: ${dimensions.height}</div>
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
const ConnectedComponent = connectViewport()(Component);

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
import { ObserveBoundingClientRect, IRect } from 'react-viewport-uitls';

const Component = ({ rect: IRect, initRect: IRect }) => (
  <React.Fragment>
    <div>Current top: {rect.top}</div>
    <div>Current right: {rect.right}</div>
    <div>Current bottom: {rect.bottom}</div>
    <div>Current left: {rect.left}</div>
    <div>Current height: {rect.height}</div>
    <div>Current width: {rect.width}</div>
    <div>Initial top: {initRect.top}</div>
    <div>Initial right: {initRect.right}</div>
    <div>Initial bottom: {initRect.bottom}</div>
    <div>Initial left: {initRect.left}</div>
    <div>Initial height: {initRect.height}</div>
    <div>Initial width: {initRect.width}</div>
  </React.Fragment>
);

class Component extends React.Component<{}, IRect> {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.state = {};
  }

  render() {
    return (
      <ObserveBoundingClientRect
        node={this.ref}
        onInit={rect => this.setState(rect)}
      >
        {rect => (
          <div ref={this.ref}>
            {Boolean(rect) && <Component rect={rect} initRect={this.state} />}
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

In case no nodes should be rendered by `ObserveBoundingClientRect`, instead of using `children` as a function it is also possible to use the `onUpdate` function.

```javascript
<div ref={this.ref}></div>
<ObserveBoundingClientRect
  node={this.ref}
  onUpdate={rect => {
    this.setState(rect);
  }}
/>
```

## License

Licensed under the [MIT License](https://opensource.org/licenses/mit-license.php).
