/**
 * @jest-environment jsdom
 */

// force fallback to setTimeout
// @ts-ignore
delete window.requestAnimationFrame;
jest.useFakeTimers();

import React, { useState, useRef } from 'react';
import { act } from 'react-dom/test-utils';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { ViewportProvider, useViewport, useLayoutSnapshot } from '../index';

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
    (window as any).scrollX = 0;
    (window as any).scrollY = 0;
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

  describe('useLayoutSnapshot', () => {
    it('should update snapshot on scroll', () => {
      const App = () => {
        const ref = useRef<HTMLDivElement>(null);
        const snapshot = useLayoutSnapshot(({ scroll }) => {
          if (ref.current) {
            return `${ref.current.dataset.info},${scroll.y}`;
          }
          return null;
        });
        return (
          <div ref={ref} data-info="pony">
            {snapshot}
          </div>
        );
      };
      const { getByText } = render(
        <ViewportProvider>
          <App />
        </ViewportProvider>,
      );
      scrollTo(0, 1000);
      act(() => {
        jest.advanceTimersByTime(20);
      });
      expect(getByText('pony,1000')).toBeDefined();
    });

    it('should update snapshot on dependency change', () => {
      const App = ({ info }: { info: string }) => {
        const ref = useRef<HTMLDivElement>(null);
        const snapshot = useLayoutSnapshot(
          ({ scroll }) => {
            if (ref.current) {
              return `${ref.current.dataset.info},${scroll.y}`;
            }
            return null;
          },
          [info],
        );
        return (
          <div ref={ref} data-info={info}>
            {snapshot}
          </div>
        );
      };
      const { getByText, rerender } = render(
        <ViewportProvider>
          <App info="pony" />
        </ViewportProvider>,
      );
      act(() => {
        jest.advanceTimersByTime(20);
      });
      expect(getByText('pony,0')).toBeDefined();
      rerender(
        <ViewportProvider>
          <App info="foo" />
        </ViewportProvider>,
      );
      act(() => {
        jest.advanceTimersByTime(20);
      });
      expect(getByText('foo,0')).toBeDefined();
    });
  });
});
