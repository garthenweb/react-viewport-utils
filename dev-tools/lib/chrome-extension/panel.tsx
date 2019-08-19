import * as React from 'react';
import { render } from 'react-dom';
import { DevTools, IDevToolListener } from '../index';

const useListeners = () => {
  const [listeners, setListeners] = React.useState<IDevToolListener[]>([]);
  React.useEffect(() => {
    const update = (data: { listeners: IDevToolListener[] }) =>
      setListeners(data.listeners);
    chrome.runtime.onMessage.addListener(update);
    return () => chrome.runtime.onMessage.removeListener(update);
  }, []);
  return listeners;
};

const Panel = () => {
  const listeners = useListeners();
  return <DevTools listeners={listeners} />;
};

render(<Panel />, document.querySelector('main'));
