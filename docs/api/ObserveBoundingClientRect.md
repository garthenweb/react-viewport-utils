# ObserveBoundingClientRect (deprecated)

Observes for changes to the bounding client rect of a given reference.

**!!! Be careful with this component, it can cause really bad performance if overused. Therefor it is deprecated and will be removed with the next mayor release, it is recommended to switch to the new useReact or useReactEffect hooks instead !!!**

``` javascript
import * as React from 'react';
import { ObserveBoundingClientRect } from 'react-viewport-uitls';

const Component = ({ rect, initRect }) => (
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

class Component extends React.Component {
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
