import * as React from 'react';
import wrapDisplayName from 'recompose/wrapDisplayName';

import ObserveViewport, {
  IChildProps as IWrapperProps,
} from './ObserveViewport';

type TPropStrings = 'scroll' | 'dimensions';

interface IOptions {
  omit?: TPropStrings[];
}

export default function connect(options: IOptions = {}) {
  const omit = options.omit || [];
  const shouldOmitScroll = omit.indexOf('scroll') !== -1;
  const shouldOmitDimensions = omit.indexOf('dimensions') !== -1;
  return <P extends object>(
    WrappedComponent: React.ComponentType<P & IWrapperProps>,
  ): React.ComponentClass<P> => {
    return class ConnectViewport extends React.Component<P, {}> {
      static displayName: string = wrapDisplayName(WrappedComponent, 'connect');

      render() {
        return (
          <ObserveViewport
            disableScrollUpdates={shouldOmitScroll}
            disableDimensionsUpdates={shouldOmitDimensions}
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
