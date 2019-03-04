# Observe the Viewport

Dependent on the use case we support different ways to connect to the viewport properties. All options described in this document will expose the current `scroll` and `dimensions` information collected by a `ViewportProvider`.

## Render Props/ Event Handler: `ObserveViewport`

Render props are easy to implement in the most situations but the event handler allows more control about performance and to trigger side effects.

### API

| Property | Type | Required? | Description |
|:---|:---|:---:|:---|
| onUpdate | function |  | Triggers as soon as a viewport update was detected. Contains the `IViewport` as the first argument and the last return of `recalculateLayoutBeforeUpdate` as the second argument |
| recalculateLayoutBeforeUpdate | function |  | Enables a way to calculate layout information for all components as a badge before the onUpdate call. Contains the `IViewport` as the first argument. See [recalculateLayoutBeforeUpdate](../concepts/recalculateLayoutBeforeUpdate.md) |
| children | function |  | Like `onUpdate` but expects to return that will be rendered on the page. Contains the `IViewport` as the first argument. |
| deferUpdateUntilIdle | boolean |  | Defers to trigger updates until the collector is idle. See [Defer Events](../concepts/defer_events.md) |
| priority | `'low'`, `'normal'`, `'high'`, `'highest'` |  | Allows to set a priority of the update. See [Defer Events](../concepts/scheduler.md) |
| disableScrollUpdates | boolean |  | Disables updates to scroll events |
| disableDimensionsUpdates | boolean |  | Disables updates to dimensions events |

### Example

``` javascript
import * as React from 'react';
import {
  ViewportProvider,
  ObserveViewport,
} from 'react-viewport-uitls';

const handleUpdate = ({ scroll, dimensions }) {
  console.log(scroll, dimensions);
}

render(
  <ViewportProvider>
    <div>
      <ObserveViewport priority="low" onUpdate={handleUpdate} />
    </div>
    <ObserveViewport disableDimensionsUpdates>
      {({ scroll }) => <div>{scroll.x}</div>}
    </ObserveViewport>
  </ViewportProvider>,
  document.querySelector('main')
);
```

## HOC: `connectViewport`

This is just a wrapper for the `ObserveViewport` to implement the HOC pattern.

### API

| Property | Type | Required? | Description |
|:---|:---|:---:|:---|
| omit | `['scroll', 'dimensions']` |  | Allows to disable scroll or dimensions events for the higher order component |
| deferUpdateUntilIdle | boolean |  | Defers to trigger updates until the collector is idle. See [Defer Events](../concepts/defer_events.md). |

## Example

``` javascript
import * as React from 'react';
import {
  ViewportProvider,
  connectViewport,
} from 'react-viewport-utils';

const Component = ({ scroll, dimensions }) => (
  <>
    <div>Dimension (inner)width: ${dimensions.width}</div>
    <div>Dimension (inner)height: ${dimensions.height}</div>
    <div>Scroll X: {scroll.x}</div>
    <div>Scroll Y: {scroll.y}</div>
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

## Hooks: `useViewport`, `useScroll`, `useDimensions`, `useLayoutSnapshot`

[Hooks](https://reactjs.org/docs/hooks-intro.html) are probably the easiest way to update your components but as of now needs to be consumed with care because this API and hooks in general are in early stage and thus are may contain bugs or will undergo breaking changes. As always, please report bugs if you find some.

**!!! Hooks require a `ViewportProvider` as a parent and only work with react v16.7.0 !!!**

### API

| Property | Type | Required? | Description |
|:---|:---|:---:|:---|
| disableScrollUpdates | boolean |  | Disables updates to scroll events (only for `useViewport` and `useLayoutSnapshot`) |
| disableDimensionsUpdates | boolean |  | Disables updates to dimensions events (only for `useViewport` and `useLayoutSnapshot`) |
| deferUpdateUntilIdle | boolean |  | Defers to trigger updates until the collector is idle. See [Defer Events](../concepts/defer_events.md) |
| priority | `'low'`, `'normal'`, `'high'`, `'highest'` |  | Allows to set a priority of the update. See [Defer Events](../concepts/scheduler.md) |

### Example

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

## Related docs

* [ViewportProvider](./ViewportProvider.md)
* [Types](./types.md)
