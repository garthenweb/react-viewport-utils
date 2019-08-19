import * as React from 'react';
import { IDevToolListener } from '../ui/types';
import { createChannel } from './channel';

export const useWindowListeners = () => {
  const [listeners, setListeners] = React.useState<IDevToolListener[]>([]);
  React.useEffect(
    () => createChannel(({ listeners }) => setListeners(listeners)),
    [],
  );
  return listeners;
};
