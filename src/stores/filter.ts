import { atom, computed } from 'nanostores'

export const query = atom<string>('')

export const artistIds = atom<number[]>([])
export const tagIds = atom<number[]>([])
export const musicPlatformId = atom<string>('')
export const onlyNewSongs = atom<boolean>(false)

export const isFiltered = computed(
  [artistIds, tagIds, musicPlatformId, onlyNewSongs],
  (artistIds, tagIds, musicPlatformId, onlyNewSongs) =>
    artistIds.length > 0 ||
    tagIds.length > 0 ||
    musicPlatformId.length > 0 ||
    onlyNewSongs,
)
