import * as React from 'react';

import { IScroll, IDimensions } from './index';
import ObserveViewport from './ObserveViewport';

interface IInjectedProps {
  scroll?: IScroll | null;
  dimensions?: IDimensions | null;
}

type TPropStrings = 'scroll' | 'dimensions';

interface IOptions {
  omit?: TPropStrings[];
  deferUpdateUntilIdle?: boolean;
}

export default function connect(options: IOptions = {}) {
  const deferUpdateUntilIdle = Boolean(options.deferUpdateUntilIdle);
  const omit = options.omit || [];
  const shouldOmitScroll = omit.indexOf('scroll') !== -1;
  const shouldOmitDimensions = omit.indexOf('dimensions') !== -1;
  return <P extends object>(
    WrappedComponent: React.ComponentType<P & IInjectedProps>,
  ): React.ComponentClass<P> => {
    const displayName =
      WrappedComponent.displayName || WrappedComponent.name || 'Component';
    return class ConnectViewport extends React.Component<P, {}> {
      static displayName = `connectViewport(${displayName})`;

      render() {
        return (
          <ObserveViewport
            disableScrollUpdates={shouldOmitScroll}
            disableDimensionsUpdates={shouldOmitDimensions}
            deferUpdateUntilIdle={deferUpdateUntilIdle}
            displayName={ConnectViewport.displayName}
            debuggerComponentType="connectViewport"
          >
            {({ scroll, dimensions }) => (
              <WrappedComponent
                scroll={scroll}
                dimensions={dimensions}
                {...this.props}
              />
            )}
          </ObserveViewport>
        );
      }
    };
  };
}
