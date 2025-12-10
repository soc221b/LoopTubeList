import React from 'react';
import { render, cleanup, act } from '@testing-library/react';
import PlaylistPlayer from '../../components/PlaylistPlayer';

// Load jest-axe dynamically inside the test. If it's not installed, skip the a11y assertion.

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

    let container: HTMLElement | undefined;
    await act(async () => {
      const r = render(<PlaylistPlayer playlistId="PLA11Y" />);
      container = r.container;
    });
    // Try to require jest-axe. If missing, skip the axe assertions.
    let jestAxe: any;
    try {
      jestAxe = require('jest-axe');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('jest-axe not installed; skipping axe accessibility assertions');
      return;
    }

    const { axe, toHaveNoViolations } = jestAxe;
    (expect as any).extend(toHaveNoViolations as any);
    const results = await axe(container as HTMLElement);
    expect(results).toHaveNoViolations();
  });
});
