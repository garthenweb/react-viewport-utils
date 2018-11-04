### Experimental Scheduler

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
