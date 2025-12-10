import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import PlaylistPlayer from '../../components/PlaylistPlayer';

expect.extend(toHaveNoViolations as any);

describe('PlaylistPlayer accessibility', () => {
  afterEach(() => {
    // @ts-ignore
    delete (window as any).YT;
    cleanup();
  });

  test('has no detectable axe violations when ready', async () => {
    // Mock YT.Player that immediately calls onReady
    // @ts-ignore
    (window as any).YT = {
      Player: function (el: any, options: any) {
        this.getPlaylistIndex = () => 0;
        this.getVideoData = () => ({ title: 'A11y' });
        this.playVideo = () => {};
        this.pauseVideo = () => {};
        this.nextVideo = () => {};
        this.previousVideo = () => {};
        this.destroy = () => {};
        if (options && options.events && typeof options.events.onReady === 'function') {
          options.events.onReady({ target: this });
        }
      },
      PlayerState: { PLAYING: 1, PAUSED: 2 },
    };

    const { container } = render(<PlaylistPlayer playlistId="PLA11Y" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
