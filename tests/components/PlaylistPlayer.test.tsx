import React from 'react';
import { render, screen, act, cleanup } from '@testing-library/react';
import PlaylistPlayer from '../../components/PlaylistPlayer';

describe('PlaylistPlayer', () => {
  afterEach(() => {
    // clean up any global mocks
    // @ts-ignore
    delete (window as any).YT;
    cleanup();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('calls onReady and hides loading when player becomes ready', async () => {
    jest.useFakeTimers();

    const onReady = jest.fn();
    const onError = jest.fn();

    // Mock Player that invokes onReady asynchronously
    // @ts-ignore
    (window as any).YT = {
      Player: function (el: any, options: any) {
        this.el = el;
        this.destroy = jest.fn();
        // simulate async ready
        setTimeout(() => {
          if (options && options.events && typeof options.events.onReady === 'function') {
            options.events.onReady();
          }
        }, 0);
      },
    };

    await act(async () => {
      render(<PlaylistPlayer playlistId="PLFAKE" onReady={onReady} onError={onError} />);
    });

    // Loading indicator initially present
    expect(screen.getByText(/Loading player/)).toBeInTheDocument();

    // Fast-forward timers so the mock Player calls onReady
    await act(async () => {
      jest.runAllTimers();
    });

    // onReady should have been called, onError not
    expect(onReady).toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();

    // Loading text should be gone
    expect(screen.queryByText(/Loading player/)).toBeNull();
  });

  test('calls onError when player does not become ready within timeout', async () => {
    jest.useFakeTimers();

    const onReady = jest.fn();
    const onError = jest.fn();

    // Mock Player that never calls onReady
    // @ts-ignore
    (window as any).YT = {
      Player: function (el: any, options: any) {
        this.el = el;
        this.destroy = jest.fn();
        // never call onReady
      },
    };

    await act(async () => {
      render(<PlaylistPlayer playlistId="PLTIMEOUT" onReady={onReady} onError={onError} />);
    });

    // Advance time by 8s to trigger the component's timeout
    await act(async () => {
      jest.advanceTimersByTime(8000);
    });

    expect(onError).toHaveBeenCalled();
    expect(onReady).not.toHaveBeenCalled();
  });
});
