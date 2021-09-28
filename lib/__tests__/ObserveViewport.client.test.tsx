/**
 * @jest-environment jsdom
 */

// force fallback to setTimeout
// @ts-ignore
delete window.requestAnimationFrame;
// @ts-ignore
delete window.cancelAnimationFrame;
jest.useFakeTimers();

import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { ViewportProvider, ObserveViewport } from '../index';

const App = ({
  renderFnMock,
  updateFnMock,
}: {
  renderFnMock?: () => null;
  updateFnMock?: () => null;
}) => {
  const [disableScroll, updateDisableScroll] = React.useState(false);
  const [disableDimensions, updateDisableDimensions] = React.useState(false);
  return (
    <ViewportProvider>
      <button onClick={() => updateDisableScroll(!disableScroll)}>
        Toggle scroll
      </button>
      <button onClick={() => updateDisableDimensions(!disableDimensions)}>
        Toggle dimensions
      </button>
      <ObserveViewport
        disableScrollUpdates={disableScroll}
        disableDimensionsUpdates={disableDimensions}
        onUpdate={updateFnMock}
      >
        {renderFnMock}
      </ObserveViewport>
    </ViewportProvider>
  );
};

describe('ObserveViewport', () => {
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
    (window.addEventListener as jest.Mock).mockRestore();
    jest.clearAllTimers();
    (window as any).scrollX = 0;
    (window as any).scrollY = 0;
  });

  it('should trigger initial scroll value', () => {
    const renderFnMock = jest.fn(() => null);
    window.scrollTo(0, 1000);
    render(<App renderFnMock={renderFnMock} />);

    jest.advanceTimersByTime(1000);

    expect(renderFnMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        scroll: expect.objectContaining({
          y: 1000,
          x: 0,
        }),
      }),
    );
  });

  it('should trigger changed values after scroll event', () => {
    const renderFnMock = jest.fn(() => null);
    window.scrollTo(0, 1000);
    render(<App renderFnMock={renderFnMock} />);
    jest.advanceTimersByTime(1000);

    expect(renderFnMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        scroll: expect.objectContaining({
          y: 1000,
          x: 0,
        }),
      }),
    );

    window.scrollTo(0, 500);

    jest.advanceTimersByTime(1000);
    expect(renderFnMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        scroll: expect.objectContaining({
          y: 500,
          x: 0,
        }),
      }),
    );
  });

  it('should not trigger changed values over time if disabled', () => {
    const renderFnMock = jest.fn(() => null);
    window.scrollTo(0, 1000);
    const { getByText } = render(<App renderFnMock={renderFnMock} />);
    jest.advanceTimersByTime(1000);

    expect(renderFnMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        scroll: expect.objectContaining({
          y: 1000,
          x: 0,
        }),
      }),
    );

    fireEvent.click(getByText('Toggle scroll'));

    window.scrollTo(0, 500);

    jest.advanceTimersByTime(1000);
    expect(renderFnMock).not.toHaveBeenLastCalledWith(
      expect.objectContaining({
        scroll: expect.objectContaining({
          y: 500,
          x: 0,
        }),
      }),
    );
  });

  it('should trigger update when toggling from active to inactive for render function', () => {
    const renderFnMock = jest.fn(() => null);
    window.scrollTo(0, 1000);
    const { getByText } = render(<App renderFnMock={renderFnMock} />);
    jest.advanceTimersByTime(1000);

    expect(renderFnMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        scroll: expect.objectContaining({
          y: 1000,
          x: 0,
        }),
      }),
    );

    fireEvent.click(getByText('Toggle scroll'));

    window.scrollTo(0, 500);

    jest.advanceTimersByTime(1000);
    expect(renderFnMock).not.toHaveBeenLastCalledWith(
      expect.objectContaining({
        scroll: expect.objectContaining({
          y: 500,
          x: 0,
        }),
      }),
    );

    fireEvent.click(getByText('Toggle scroll'));

    jest.advanceTimersByTime(1000);
    expect(renderFnMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        scroll: expect.objectContaining({
          y: 500,
          x: 0,
        }),
      }),
    );
  });

  it('should trigger update when toggling from active to inactive for onUpdate function', () => {
    const updateFnMock = jest.fn(() => null);
    window.scrollTo(0, 1000);
    const { getByText } = render(<App updateFnMock={updateFnMock} />);
    jest.advanceTimersByTime(1000);

    expect(updateFnMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        scroll: expect.objectContaining({
          y: 1000,
          x: 0,
        }),
      }),
      null,
    );

    fireEvent.click(getByText('Toggle scroll'));

    window.scrollTo(0, 500);

    jest.advanceTimersByTime(1000);
    expect(updateFnMock).not.toHaveBeenLastCalledWith(
      expect.objectContaining({
        scroll: expect.objectContaining({
          y: 500,
          x: 0,
        }),
      }),
      null,
    );

    fireEvent.click(getByText('Toggle scroll'));

    jest.advanceTimersByTime(1000);
    expect(updateFnMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        scroll: expect.objectContaining({
          y: 500,
          x: 0,
        }),
      }),
      null,
    );
  });
});
