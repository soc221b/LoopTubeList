import React from 'react';
import { render, screen, act, cleanup } from '@testing-library/react';
import PlaylistPlayer from '../../components/PlaylistPlayer';

describe('PlaylistPlayer error mapping', () => {
  afterEach(() => {
    // @ts-ignore
    delete (window as any).YT;
    cleanup();
    jest.clearAllMocks();
  });

  test('shows friendly message for known YouTube error code', async () => {
    // Mock YT.Player which triggers onError with code 100
    // @ts-ignore
    (window as any).YT = {
      Player: function (el: any, options: any) {
        this.destroy = jest.fn();
        // call onError with data=100
        if (options && options.events && typeof options.events.onError === 'function') {
          options.events.onError({ data: 100 });
        }
      },
    };

    await act(async () => {
      render(<PlaylistPlayer playlistId="PLERR" />);
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(/not found|removed|private/i);
  });
});
