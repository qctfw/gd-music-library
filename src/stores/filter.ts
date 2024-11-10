import { atom } from 'nanostores'

export const query = atom<string>('')
export const artistIds = atom<number[]>([])
export const tagIds = atom<number[]>([])
export const musicPlatformId = atom<string>('')