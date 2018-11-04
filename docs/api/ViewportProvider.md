# ViewportProvider

The ViewportProvider is the heart because it collects and delegates global viewport information to connected components.

All other components needs to be a child of the `ViewportProvider` to receive events.

In case you are building libraries, don't worry about having more than one `ViewportProvider` within the tree. The library will detect other `ViewportProvider` and make sure that only on provider will collect and send out events.

## API

| Property | Type | Required? | Description |
|:---|:---|:---:|:---|
| experimentalSchedulerEnabled | boolean |  | If set enables the experimental scheduler which allows to make use of the `priority` props on connected components to drop frames if necessary for a smooth user experience. |
| children | ReactNode | ✓ | Any react node that should be rendered. Nested in the tree can be components that connect to viewport updates |

## Example

``` javascript
import * as React from 'react';
import {
  ViewportProvider,
  connectViewport,
} from 'react-viewport-uitls';

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

## Related docs

* [Observe the Viewport](./ObserveViewport_connectViewport_useViewport.md)
* [Scheduler](../concepts/scheduler.md)
