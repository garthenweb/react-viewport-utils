// force fallback to setTimeout
delete window.requestAnimationFrame;
jest.useFakeTimers();

import React, { useState } from 'react';
import { act } from 'react-dom/test-utils';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { ViewportProvider, useViewport } from '../index';

const scrollTo = (x: number, y: number) => {
  window.scrollTo(x, y);
  act(() => {
    jest.advanceTimersByTime(20);
  });
};

describe('hooks', () => {
  beforeEach(() => {
    const eventMap: any = {
      scroll: jest.fn(),
    };
    jest.spyOn(window, 'addEventListener').mockImplementation((event, cb) => {
      eventMap[event] = cb;
    });

    jest
      .spyOn(window, 'scrollTo')
      .mockImplementation((x: number, y: number) => {
        (window as any).scrollX = x;
        (window as any).scrollY = y;
        eventMap.scroll && eventMap.scroll();
      });
  });

  afterEach(() => {
    cleanup();
    jest.clearAllTimers();
  });

  describe('useViewport', () => {
    it('should update on viewport change', async () => {
      const App = () => {
        const viewport = useViewport();
        return (
          <div>
            scroll: {viewport.scroll.x},{viewport.scroll.y}
          </div>
        );
      };
      const { getByText } = render(
        <ViewportProvider>
          <App />
        </ViewportProvider>,
      );
      act(() => {
        jest.advanceTimersByTime(20);
      });
      scrollTo(0, 1000);
      expect(getByText('scroll: 0,1000')).toBeDefined();

      scrollTo(0, 2000);
      expect(getByText('scroll: 0,2000')).toBeDefined();
    });

    it('should not update if disabled', async () => {
      const App = () => {
        const viewport = useViewport({
          disableScrollUpdates: true,
        });
        return (
          <div>
            scroll: {viewport.scroll.x},{viewport.scroll.y}
          </div>
        );
      };
      const { rerender, getByText } = render(<ViewportProvider />);
      scrollTo(0, 1000);
      rerender(
        <ViewportProvider>
          <App />
        </ViewportProvider>,
      );
      act(() => {
        jest.advanceTimersByTime(20);
      });
      expect(getByText('scroll: 0,1000')).toBeDefined();
      scrollTo(0, 2000);
      expect(getByText('scroll: 0,1000')).toBeDefined();
    });

    it('should not update if disabled at runtime', async () => {
      const App = () => {
        const [disableScrollUpdates, setDisableScrollUpdate] = useState(false);
        const viewport = useViewport({
          disableScrollUpdates,
        });
        return (
          <div onClick={() => setDisableScrollUpdate(!disableScrollUpdates)}>
            scroll: {viewport.scroll.x},{viewport.scroll.y}
          </div>
        );
      };
      const { rerender, getByText } = render(<ViewportProvider />);
      scrollTo(0, 1000);
      rerender(
        <ViewportProvider>
          <App />
        </ViewportProvider>,
      );
      act(() => {
        jest.advanceTimersByTime(20);
      });
      expect(getByText('scroll: 0,1000')).toBeDefined();

      // disable
      fireEvent.click(getByText('scroll: 0,1000'));
      scrollTo(0, 2000);
      expect(getByText('scroll: 0,1000')).toBeDefined();

      // enable
      fireEvent.click(getByText('scroll: 0,1000'));

      scrollTo(0, 3000);
      expect(getByText('scroll: 0,3000')).toBeDefined();
    });
  });
});
