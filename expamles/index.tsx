import * as React from 'react';
import { render } from 'react-dom';

import Provider from '../lib/index';
import StickyScrollUp from './StickyScrollUp';
import Sticky from './Sticky';
import StickyGroupProvider from './StickyGroup';

import './styles.css';

const Placeholder = () => <div className="placeholder" />;

class Example extends React.Component {

  private container1: React.RefObject<any>

  constructor(props){
    super(props)
    this.container1 = React.createRef()
  }

  render() {
    return (
      <StickyGroupProvider>
        <StickyScrollUp>
          <div className="header">Header</div>
        </StickyScrollUp>
        <Placeholder />
        <div ref={this.container1}>
          <Sticky container={this.container1}>
            <div className="sticky-inline">
              Sticky inline1
            </div>
          </Sticky>
          <Placeholder />
        </div>
        <Sticky>
          <div className="sticky-inline">
            Sticky inline2
          </div>
        </Sticky>
        <Placeholder />
        <Placeholder />
        <Placeholder />
      </StickyGroupProvider>
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
