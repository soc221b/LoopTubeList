import React from 'react';
import { render, screen, act, fireEvent, cleanup } from '@testing-library/react';
import PlaylistPlayer from '../../components/PlaylistPlayer';

describe('PlaylistPlayer controls', () => {
  afterEach(() => {
    // @ts-ignore
    delete (window as any).YT;
    cleanup();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('next and previous buttons call underlying player methods', async () => {
    const mockNext = jest.fn();
    const mockPrev = jest.fn();
    const mockPlay = jest.fn();
    const mockPause = jest.fn();
    const mockGetIndex = jest.fn().mockReturnValue(2);
    const mockGetVideoData = jest.fn().mockReturnValue({ title: 'Hello' });

    // Mock YT.Player that stores events and exposes methods
    // @ts-ignore
    (window as any).YT = {
      Player: function (el: any, options: any) {
        // assign methods first so the onReady event can read metadata
        this.nextVideo = mockNext;
        this.previousVideo = mockPrev;
        this.playVideo = mockPlay;
        this.pauseVideo = mockPause;
        this.getPlaylistIndex = mockGetIndex;
        this.getVideoData = mockGetVideoData;
        this.destroy = jest.fn();
        // store events so tests can simulate state changes
        (this as any).events = options && options.events;
        // call onReady and pass the player as event.target
        if (options && options.events && typeof options.events.onReady === 'function') {
          options.events.onReady({ target: this });
        }
      },
      PlayerState: { PLAYING: 1, PAUSED: 2 },
    };

    await act(async () => {
      render(<PlaylistPlayer playlistId="PLCTRL" />);
    });

    // Title and index should be displayed after ready
    expect(await screen.findByText(/Hello/)).toBeInTheDocument();
    expect(screen.getByText(/#3/)).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /next/i });
    const prevBtn = screen.getByRole('button', { name: /previous/i });
    const playBtn = screen.getByRole('button', { name: /play/i });

    await act(async () => {
      fireEvent.click(nextBtn);
    });
    expect(mockNext).toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(prevBtn);
    });
    expect(mockPrev).toHaveBeenCalled();

    // click play -> playVideo
    await act(async () => {
      fireEvent.click(playBtn);
    });
    expect(mockPlay).toHaveBeenCalled();
  });
});
