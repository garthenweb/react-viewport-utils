const SOURCE = '__REACT_VIEWPORT_UTILS__';

export const createChannel = (update: (data: { listeners: [] }) => void) => {
  const handleEvent = (ev: MessageEvent) => {
    if (ev.data.source === SOURCE) {
      update(ev.data);
    }
  };

  const channel = new MessageChannel();
  const postMessage = (type: string) => {
    window.postMessage(
      {
        source: SOURCE,
        type,
      },
      '*',
      [channel.port2],
    );
  };
  channel.port1.onmessage = handleEvent;
  postMessage('connect');
  return () => channel.port1.close();
};
