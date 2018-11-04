# Defer events

Some updates are heavy and might reduce the user experience when scheduled simultaneously to others. Therefore its possible to defer events until idle by enabling `deferUpdateUntilIdle` (default is `false`). If enabled, the `onUpdate` callback/ the rerender of the component will be deferred until no events (independent whether `omit`, `disableDimensionsUpdates` or `disableScrollUpdates` is used) are scheduled anymore.

This option is available for

* ObserveViewport
* connectViewport
* useViewport, useScroll, useDimensions, useLayoutSnapshot

## Example

``` javascript
<ObserveViewport
  deferUpdateUntilIdle
  onUpdate={handleUpdate}
/>

const ConnectedComponent = connectViewport({ deferUpdateUntilIdle: true })(Component);
```
