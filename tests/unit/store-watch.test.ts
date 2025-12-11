import { expect, it, describe } from 'vitest'
import { useStore } from '../../src/state/store'
import { getWatchRecord, removeWatchRecord } from '../../src/lib/persistence'

describe('store watch progress', () => {
  it('setWatchProgress saves to persistence and updates store', () => {
    // add a video then set progress
    const store = useStore.getState()
    store.addVideo({ id: 'vid1', source_url: 'https://youtu.be/vid1' } as any)
    store.setWatchProgress('vid1', 15)

    const rec = getWatchRecord('vid1')
    expect(rec).not.toBeNull()
    expect(rec?.last_position_seconds).toBe(15)

    const stateVideo = useStore.getState().videos['vid1']
    expect(stateVideo.last_watched_position_seconds).toBe(15)

    // cleanup
    removeWatchRecord('vid1')
  })
})
