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

### ViewportProvider/ connectViewport/ ObserveViewport

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
    <div>Dimension (inner)width: ${dimensions.width}</div>
    <div>Dimension (inner)height: ${dimensions.height}</div>
    <div>Dimension outerWidth: ${dimensions.outerWidth}</div>
    <div>Dimension outerHeight: ${dimensions.outerHeight}</div>
    <div>Dimension clientWidth: ${dimensions.clientWidth}</div>
    <div>Dimension clientHeight: ${dimensions.clientHeight}</div>
    <div>Dimension documentWidth: ${dimensions.documentWidth}</div>
    <div>Dimension documentHeight: ${dimensions.documentHeight}</div>
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

In some situations more control is required to do perform heavy tasks. Therefore the `ObserveViewport` component allows to update without rendering.

``` javascript
import * as React from 'react';
import {
  ViewportProvider,
  ObserveViewport,
  IScroll,
  IDimensions,
} from 'react-viewport-uitls';

interface IViewport {
  scroll: IScroll,
  dimensions: IDimensions,
}

const handleUpdate = ({ scroll, dimensions }: IViewport) {
  console.log(scroll, dimensions);
}

render(
  <ViewportProvider>
    <div>
      <ObserveViewport onUpdate={handleUpdate} />
    </div>
  </ViewportProvider>,
  document.querySelector('main')
);
```

When an update is triggered, sometimes further calculations on the DOM which might trigger [layouts/ reflows](https://gist.github.com/paulirish/5d52fb081b3570c81e3a) are required to execute a task.
In general the best performance is archive by first reading all the values in one badge and later update the DOM again. With multiple components in one page this can become difficult.

The optional `recalculateLayoutBeforeUpdate` property, which accepts a function, will allow to exactly handle those reads in one badge for all components to later perform the update:

* first all `recalculateLayoutBeforeUpdate` functions for all components are executed.
* second all `onUpdate` function are called which receive the value returned from `recalculateLayoutBeforeUpdate` as the second argument.

``` javascript
<ObserveViewport
  recalculateLayoutBeforeUpdate={() => el.getBoundingClientRect()}
  onUpdate={({ scroll }, rect) => console.log('Top offset: ', scroll.y + rect.top))}
/>
```

#### Omit events

In case only certain updates are required `connectViewport` allows an `omit` option to skip updates to `scroll` and `dimensions` events. If both strings are included within the `omit` array, no events will get triggered at all.

``` javascript
const ConnectedComponent = connectViewport({ omit: ['scroll', 'dimensions'] })(Component);
```

The same works for `ObserveViewport` by using the `disableScrollUpdates` and `disableDimensionsUpdates` property.

``` javascript
<ObserveViewport
  disableScrollUpdates
  disableDimensionsUpdates
  onUpdate={handleUpdate}
/>
```

### Defer events

Some updates are heavy and might reduce the user experience when scheduled with the same priority as others. Therefore its possible to defer events until idle by enabling `deferUpdateUntilIdle` (default is `false`). If enabled, the `onUpdate` callback/ the rerender of the component will be deferred until no events (independent whether `omit`, `disableDimensionsUpdates` or `disableScrollUpdates` is used) are scheduled anymore.

``` javascript
<ObserveViewport
  deferUpdateUntilIdle
  onUpdate={handleUpdate}
/>

const ConnectedComponent = connectViewport({ deferUpdateUntilIdle: true })(Component);
```

### `NEW` Experimental Scheduler

Some updates on the page have higher priority than others, e.g. an animation of a visible element is more important for a good ux than a tracking event that fires after a certain scroll position. For sure, the tracking event must fire at some point in time but it is not important that it fires immediately.

The scheduler is able to handle those differences. By default it measures the amount of time an update needs in average and might drop some frames in favor of others. To tell which Observers are more important than others it allows to set 4 different levels: `highest`, `high`, `normal` and `low`.

The scheduler learns over time based on how fast updates are executed, therefore the amount of events called depend heavily on the platform. On a low end device it will fire way less events than on a high end device.

When the scheduler is disabled, all observers have priority `highest` as default and will therefore never drop frames. Default when enabled is `normal`.

Its always guaranteed that the observer fires at some point in time with the recent updates but it might drop some frames in between if `priority` is not set to `highest`.

The scheduler is for now disabled by default and needs to be activated on the `ViewportProvider`.

**!!! This is an experimental API and its implementation might change in the future !!!**

``` javascript
const handleUpdate = ({ scroll, dimensions }: IViewport) {
  console.log(scroll, dimensions);
}

render(
  <ViewportProvider experimentalSchedulerEnabled>
    <ObserveViewport priority="high" onUpdate={handleUpdate} />
    <ObserveViewport priority="low" onUpdate={handleUpdate} />
  </ViewportProvider>,
  document.querySelector('main')
);
```

The priority of an observer can be updated at runtime which allows to update priority e.g. for elements that are not visible at the moment.

### `NEW` Hooks

With React 16.7 a new API called [Hooks](https://reactjs.org/docs/hooks-intro.html) is introduced. `react-viewport-utils` exposes `useViewport`, `useScroll` and `useDimensions`. Please not that this API is early stage and thus are this hooks as well, use with caution and report bugs in case you note some.

**!!! Hooks also require a `ViewportProvider` as a parent !!!**

``` javascript
import * as React from 'react';
import { useScroll, useDimensions } from 'react-viewport-utils';

function Component() {
  const scroll = useScroll();
  const dimensions = useDimensions({
    deferUpdateUntilIdle: true,
  });

  return (
    <div>
      Scroll Position: ${scroll.x}x${scroll.y}<br />
      Window Size: ${dimensions.innerWidth}x${dimensions.innerHeight}
    </div>
  );
}
```

### ObserveBoundingClientRect

Observes for changes to the bounding client rect of a given reference.

**!!! Be careful with this component. It can cause really bad performance if overused !!!**

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
