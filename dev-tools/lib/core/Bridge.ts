import { IListener } from '../../../lib/ViewportProvider';
import { IDevToolListener } from '../ui/types';

const SOURCE = '__REACT_VIEWPORT_UTILS__';

const isAllowedEvent = (ev: MessageEvent) => {
  return ev.data.source === SOURCE;
};

export default class Bridge {
  channels: Set<MessagePort>;
  lastListeners?: IDevToolListener[];

  static prepareListener = ({
    handler,
    recalculateLayoutBeforeUpdate,
    notifyScroll,
    notifyDimensions,
    notifyOnlyWhenIdle,
    priority,
    displayName,
    ...props
  }: IListener): IDevToolListener => ({
    ...props,
    updatesOnScroll: notifyScroll(),
    updatesOnDimensions: notifyDimensions(),
    updatesOnIdle: notifyOnlyWhenIdle(),
    priority: priority(),
    displayName: displayName(),
  });

  static postToChannel(port: MessagePort, listeners: IDevToolListener[]) {
    port.postMessage({
      source: SOURCE,
      version: '__VERSION__',
      type: 'update',
      listeners,
    });
  }

  constructor() {
    this.channels = new Set();
    window.addEventListener('message', this.handleEvent);
  }

  destroy() {
    window.removeEventListener('message', this.handleEvent);
    this.channels.clear();
  }

  handleEvent = (ev: MessageEvent) => {
    if (!isAllowedEvent(ev)) {
      return;
    }
    switch (ev.data.type) {
      case 'connect':
        this.channels.add(ev.ports[0]);
        break;
      case 'disconnect':
        this.channels.delete(ev.ports[0]);
        break;
    }
  };

  update(l: IListener[]) {
    if (this.channels.size === 0) {
      return;
    }
    const listeners = l.map(Bridge.prepareListener);
    this.lastListeners = listeners;
    this.postToChannels(listeners);
  }

  postToChannels(listeners: IDevToolListener[]) {
    this.channels.forEach(port => Bridge.postToChannel(port, listeners));
  }
}
