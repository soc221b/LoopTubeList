import { parsePlaylistId } from '../../utils/parsePlaylistId';
import testCases from '../../specs/001-add-playlist-iframe/test-cases/playlists.json';

describe('parsePlaylistId', () => {
  testCases.forEach((tc: { name: string; input: string; expectedId: string | null }) => {
    test(tc.name, () => {
      const res = parsePlaylistId(tc.input);
      if (tc.expectedId) {
        expect(res.ok).toBe(true);
        if (res.ok) expect(res.id).toBe(tc.expectedId);
      } else {
        expect(res.ok).toBe(false);
      }
    });
  });
});
