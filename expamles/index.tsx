import * as React from 'react';
import { render } from 'react-dom';

import Provider, { connectScroll } from '../lib/index';

import './styles.css';

const Header = connectScroll()(() => {
  return <div className="header">Header</div>;
});

const StickyInline = connectScroll()(() => {
  return <div className="sticky-inline">Sticky inline</div>;
});

const Placeholder = () => (
  <div className="placeholder" />
);

render(
  <main role="main">
    <Provider>
      <Header />
      <Placeholder />
      <StickyInline />
      <Placeholder />
      <StickyInline />
      <Placeholder />
      <Placeholder />
      <Placeholder />
    </Provider>
    <Placeholder />
    <Placeholder />
    <Placeholder />
  </main>,
  document.getElementById('root'),
);
