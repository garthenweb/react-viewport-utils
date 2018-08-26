import * as React from 'react';
import { render } from 'react-dom';

import Provider from '../lib/index';
import StickyScrollUp from './StickyScrollUp';
import Sticky from './Sticky';

import './styles.css';

const Placeholder = () => <div className="placeholder" />;

class Example extends React.Component {

  render() {
    return (
      <React.Fragment>
        <StickyScrollUp>
          <div className="header">Header</div>
        </StickyScrollUp>
        <Placeholder />
        <Sticky>
          <div className="sticky-inline">
            Sticky inline1
          </div>
        </Sticky>
        <Placeholder />
        <Sticky>
          <div className="sticky-inline">
            Sticky inline2
          </div>
        </Sticky>
        <Placeholder />
        <Placeholder />
        <Placeholder />
      </React.Fragment>
    );
  }
}

render(
  <main role="main">
    <Provider>
      <Example />
    </Provider>
    <Placeholder />
    <Placeholder />
    <Placeholder />
  </main>,
  document.getElementById('root'),
);
