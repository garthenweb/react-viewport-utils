# React Viewport Utils

A set of low level utility components for react to make working with the viewport (e.g scroll position or size of the page) easy to use and performant by default.

![](https://img.shields.io/npm/l/react-viewport-utils.svg)
[![](https://img.shields.io/npm/v/react-viewport-utils.svg)](https://www.npmjs.com/package/react-viewport-utils)
![](https://img.shields.io/david/garthenweb/react-viewport-utils.svg)
[![](https://img.shields.io/bundlephobia/minzip/react-viewport-utils.svg)](https://bundlephobia.com/result?p=react-viewport-utils)
[![Build Status](https://travis-ci.org/garthenweb/react-viewport-utils.svg?branch=master)](https://travis-ci.org/garthenweb/react-viewport-utils)
[![Coverage Status](https://coveralls.io/repos/github/garthenweb/react-viewport-utils/badge.svg?branch=master)](https://coveralls.io/github/garthenweb/react-viewport-utils?branch=master)

See the example folder for more information about what you can build with it.

## Why?

On a website with more sophisticated user interactions a lot of components need access to viewport information to e.g. know whether they are in the viewport, should resize or trigger an animation.

Most of the libraries reimplement the required functionality for that kind of features on its own over and over again. Those functionalities are not just hard to implement but can also, if not done well, cause the UX to suffer by introducing [layout thrashing](https://developers.google.com/web/fundamentals/performance/rendering/avoid-large-complex-layouts-and-layout-thrashing) and therefore [jank](http://jankfree.org/) and  will also cause the bundle size to grow which reduce the [time to interaction](https://philipwalton.com/articles/why-web-developers-need-to-care-about-interactivity/). Further its hard to prioritize between highly and less important events if the implementation is not bundled in one central position.

This library solves all those issues by

* using one central event handler per event to collect data
* triggers updates to components using request animation frame
* allows to prioritize the importance of updates at runtime which allows to drop frames for less important updates in case the main thread is busy
* implements patterns like `onUpdate` callbacks, [render props](https://reactjs.org/docs/render-props.html), [higher order components](https://reactjs.org/docs/higher-order-components.html) and [hooks](https://reactjs.org/docs/hooks-intro.html) which make the developer experience as simple as possible and allows the developer to concentrate on the application and not on global event handling.

## Installation/ requirements

Please note that `react` version 16.3 or higher is required for this library to work because it is using the [context](https://reactjs.org/docs/context.html) as well as [references](https://reactjs.org/docs/refs-and-the-dom.html) api.

```
npm install --save react-viewport-utils
```

By default the library ships with Typescript definitions, so there is no need to install a separate dependency. Typescript is no a requirement, all type definition are served within separate files.

For detection of some resize events the `ResizeObserver` API is used internally which is not supported in some browsers. Please make sure to implement a polyfill on your own in case its required for your application.

## Supported Environments

### Browsers

The goal is to support the most recent versions of all major browsers (Internet Explorer, Edge, Safari, Chrome and Firefox).

We try to be downward compatible with older browsers when possible to at least not throw errors, but older versions will not be test at all.

In case you have specific requirements, please fill an issue or create a PR so we can discuss about them.

### NodeJS

The project aims to support recent releases of v8 and v10 and higher of NodeJS.

## Documentation

### API

* [`ViewportProvider`](docs/api/ViewportProvider.md)
* [`ObserveViewport`](docs/api/ObserveViewport_connectViewport_useViewport.md#render-props-event-handler-observeviewport)
* [`connectViewport`](docs/api/ObserveViewport_connectViewport_useViewport.md#hoc-connectviewport)
* [`useViewport`](docs/api/ObserveViewport_connectViewport_useViewport.md#hooks-useviewport-usescroll-usedimensions-useLayoutSnapshot)
* [`useScroll`](docs/api/ObserveViewport_connectViewport_useViewport.md#hooks-useviewport-usescroll-usedimensions-useLayoutSnapshot)
* [`useDimensions`](docs/api/ObserveViewport_connectViewport_useViewport.md#hooks-useviewport-usescroll-usedimensions-useLayoutSnapshot)
* [`useLayoutSnapshot`](docs/api/ObserveViewport_connectViewport_useViewport.md#hooks-useviewport-usescroll-usedimensions-useLayoutSnapshot)
* [`NEW useViewportEffect`](docs/api/ObserveViewport_connectViewport_useViewport.md#hook-effects-useViewportEffect-useScrollEffect-useDimensionsEffect)
* [`NEW useScrollEffect`](docs/api/ObserveViewport_connectViewport_useViewport.md#hook-effects-useViewportEffect-useScrollEffect-useDimensionsEffect)
* [`NEW useDimensionsEffect`](docs/api/ObserveViewport_connectViewport_useViewport.md#hook-effects-useViewportEffect-useScrollEffect-useDimensionsEffect)
* [`NEW useRect`](docs/api/useRect.md#useRect)
* [`NEW useRectEffect`](docs/api/useRect.md#useRectEffect)
* [`DEPRECATED ObserveBoundingClientRect`](docs/api/ObserveBoundingClientRect.md)
* [Types](docs/api/types.md)

### Concepts

* [Experimental Scheduler](docs/concepts/scheduler.md)
* [recalculateLayoutBeforeUpdate](docs/concepts/recalculateLayoutBeforeUpdate.md)
* [Defer Events](docs/concepts/defer_events.md)

## License

Licensed under the [MIT License](https://opensource.org/licenses/mit-license.php).
