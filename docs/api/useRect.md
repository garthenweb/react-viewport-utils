# Observe an element

## `useRect`

Returns the rect of the elements, including it's position within the viewport as well as it's size.

Please note that at the moment the rect will only update after global scroll or resize events. Changes to the element without those interactions will not be observed (e.g. if an animation is performed).
In case you need full control over the element, I recommend using the [ResizeObserver DOM API](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver).

**!!! Hooks require a `ViewportProvider` as a parent and only work with react v16.7.0 !!!**

### API

| Argument | Type | Required? | Description |
|:---|:---|:---:|:---|
| ref | React.RefObject\<HTMLElement> | x | The reference to an element that should be observed |
| options.disableScrollUpdates | boolean |  | Disables updates to scroll events (only for `useViewport`) |
| options.disableDimensionsUpdates | boolean |  | Disables updates to dimensions events (only for `useViewport`) |
| options.deferUpdateUntilIdle | boolean |  | Defers to trigger updates until the collector is idle. See [Defer Events](../concepts/defer_events.md) |
| options.priority | `'low'`, `'normal'`, `'high'`, `'highest'` |  | Allows to set a priority of the update. See [Defer Events](../concepts/scheduler.md) |
| deps | array |  | Array with dependencies. In case a value inside the array changes, this will force an update on the rect |

### Example

``` javascript
import * as React from 'react';
import { useRect } from 'react-viewport-utils';

function Component() {
  const ref = React.useRef()
  const rect = useRect(ref) || {
    width: NaN,
    height: NaN,
  };

  return (
    <div ref={ref}>
      Current Size is {rect.width}x{rect.width}
    </div>
  );
}
```

## `useRectEffect`

Same as the `useRect` hook but as an effect, therefore it does not return anything and will not re-render the component. This should be used if a side effect should be performed.

**!!! Hooks require a `ViewportProvider` as a parent and only work with react v16.7.0 !!!**

### API

| Argument | Type | Required? | Description |
|:---|:---|:---:|:---|
| effect | (rect: IRect \| null) => void | x | The side effect that should be performed |
| ref | React.RefObject\<HTMLElement> | x | The reference to an element that should be observed |
| options.disableScrollUpdates | boolean |  | Disables updates to scroll events (only for `useViewport`) |
| options.disableDimensionsUpdates | boolean |  | Disables updates to dimensions events (only for `useViewport`) |
| options.deferUpdateUntilIdle | boolean |  | Defers to trigger updates until the collector is idle. See [Defer Events](../concepts/defer_events.md) |
| options.priority | `'low'`, `'normal'`, `'high'`, `'highest'` |  | Allows to set a priority of the update. See [Defer Events](../concepts/scheduler.md) |
| deps | array |  | Array with dependencies. In case a value inside the array changes, this will force an update to the effect function |

### Example

``` javascript
import * as React from 'react';
import { useRectEffect } from 'react-viewport-utils';

function Component() {
  const ref = React.useRef()
  useRectEffect((rect) => console.log(rect), ref)

  return (
    <div ref={ref} />
  );
}
```

## Related docs

* [ViewportProvider](./ViewportProvider.md)
* [Types](./types.md)
