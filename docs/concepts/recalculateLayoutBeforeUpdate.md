# `recalculateLayoutBeforeUpdate`

When an update is triggered, sometimes further calculations on the DOM which might trigger [layouts/ reflows](https://gist.github.com/paulirish/5d52fb081b3570c81e3a) are required to execute a task.
In general the best performance is archive by first reading all the values in one badge and later update the DOM again. With multiple components in one page this can become difficult.

The optional `recalculateLayoutBeforeUpdate` property, which accepts a function, will allow to exactly handle those reads in one badge for all components to later perform the update:

* first all `recalculateLayoutBeforeUpdate` functions for all components are executed.
* second all `onUpdate` function are called which receive the value returned from `recalculateLayoutBeforeUpdate` as the second argument.

This option is available for

* ObserveViewport
* useLayoutSnapshot

## Example

``` javascript
<ObserveViewport
  recalculateLayoutBeforeUpdate={() => el.getBoundingClientRect()}
  onUpdate={({ scroll }, rect) => console.log('Top offset: ', scroll.y + rect.top))}
/>

const Component = () => {
  const offsetTop = useLayoutSnapshot(
    ({ scroll }) => scroll.y + el.getBoundingClientRect().top
  );
}
```
