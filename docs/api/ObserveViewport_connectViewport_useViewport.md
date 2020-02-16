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
| options.priority | `'low'`, `'normal'`, `'high'`, `'highest'` |  | Allows to set a priority of the update. See [Defer Events](../concepts/scheduler.md) |

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

**!!! Hooks require a `ViewportProvider` as a parent and only work with react v16.7.0 !!!**

### API

| Argument | Type | Required? | Description |
|:---|:---|:---:|:---|
| options.disableScrollUpdates | boolean |  | Disables updates to scroll events (only for `useViewport` and `useLayoutSnapshot`) |
| options.disableDimensionsUpdates | boolean |  | Disables updates to dimensions events (only for `useViewport` and `useLayoutSnapshot`) |
| options.deferUpdateUntilIdle | boolean |  | Defers to trigger updates until the collector is idle. See [Defer Events](../concepts/defer_events.md) |
| options.priority | `'low'`, `'normal'`, `'high'`, `'highest'` |  | Allows to set a priority of the update. See [Defer Events](../concepts/scheduler.md) |

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

## Hook Effects: `useViewportEffect`, `useScrollEffect`, `useDimensionsEffect`

Hook effects allow to trigger side effects on change without updating the component.

**!!! Hooks require a `ViewportProvider` as a parent and only work with react v16.7.0 !!!**

### API

| Argument | Type | Required? | Description |
|:---|:---|:---:|:---|
| effect | (IViewport \| IScroll \| IDimensions) => void | x | Disables updates to scroll events (only for `useViewport`) |
| options.disableScrollUpdates | boolean |  | Disables updates to scroll events (only for `useViewport`) |
| options.disableDimensionsUpdates | boolean |  | Disables updates to dimensions events (only for `useViewport`) |
| options.deferUpdateUntilIdle | boolean |  | Defers to trigger updates until the collector is idle. See [Defer Events](../concepts/defer_events.md) |
| options.priority | `'low'`, `'normal'`, `'high'`, `'highest'` |  | Allows to set a priority of the update. See [Defer Events](../concepts/scheduler.md) |
| options.recalculateLayoutBeforeUpdate | function |  | Enables a way to calculate layout information for all components as a badge before the effect call. Contains `IViewport`, `IScroll` or `IDimensions` as the first argument, dependent of the used hook. See [recalculateLayoutBeforeUpdate](../concepts/recalculateLayoutBeforeUpdate.md) |
| deps | array |  | Array with dependencies. In case a value inside the array changes, this will force an update to the effect function |

### Example

``` javascript
import * as React from 'react';
import { useScrollEffect, useViewportEffect } from 'react-viewport-utils';

function Component() {
  const ref = React.useRef()
  useScrollEffect((scroll) => {
    console.log(scroll);
  });
  useViewportEffect((viewport, elementWidth) => {
    console.log(viewport, top);
  }, {
    recalculateLayoutBeforeUpdate: () => ref.current ? ref.current.getBoundingClientRect().width : null
  });

  return <div ref={ref} />;
}
```

## Related docs

* [ViewportProvider](./ViewportProvider.md)
* [Types](./types.md)
