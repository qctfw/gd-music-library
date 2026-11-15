import { atom } from 'nanostores'

import type { ChangelogMetadata } from '../types/changelog'
import type { Artist, Song, Tag } from '../types/song'
import type { MusicLibraryData, MusicLibraryWorkerRequest, MusicLibraryWorkerResponse } from './music-library-parser'
import { decodeMusicLibrary, parseMusicLibrary } from './music-library-parser'

export const version = atom(0)
export const artists = atom<Map<number, Artist>>(new Map())
export const songs = atom<Map<number, Song>>(new Map())
export const tags = atom<Map<number, Tag>>(new Map())
export const changelogs = atom<Map<number, ChangelogMetadata>>(new Map())

export const libraryFile = '149-3bdcfa6f196c94fb7d60bea8197978466bb437bae6958af4c674686d4b6a2926.txt'

const libraryFileUrl = '/datas/music-library/' + libraryFile

export const getMusicLibraryData = async (): Promise<MusicLibraryData> => {
  if (typeof Worker !== 'undefined') {
    try {
      return await fetchMusicLibraryInWorker(libraryFileUrl)
    } catch (error) {
      console.warn('Music library worker failed, falling back to the main thread.', error)
    }
  }

  return fetchMusicLibraryOnMainThread(libraryFileUrl)
}

export const processMusicLibraryData = (data: MusicLibraryData): void => {
  artists.set(data.artists)
  songs.set(data.songs)
  tags.set(data.tags)
  changelogs.set(data.changelogs)

  // Set the version last so the UI only reveals the library once it is complete.
  version.set(data.version)
}

export const loadMusicLibrary = async (): Promise<void> => {
  processMusicLibraryData(await getMusicLibraryData())
}

function fetchMusicLibraryInWorker(url: string): Promise<MusicLibraryData> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../workers/music-library.worker.ts', import.meta.url), { type: 'module' })

    worker.onmessage = (event: MessageEvent<MusicLibraryWorkerResponse>) => {
      worker.terminate()

      if (event.data.ok) {
        resolve(event.data.data)
      } else {
        reject(new Error(event.data.error))
      }
    }

    worker.onerror = (event) => {
      worker.terminate()
      reject(new Error('Music library worker failed: ' + event.message))
    }

    const request: MusicLibraryWorkerRequest = { url }
    worker.postMessage(request)
  })
}

async function fetchMusicLibraryOnMainThread(url: string): Promise<MusicLibraryData> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch music library: ${response.status} ${response.statusText}`)
  }

  const encoded = await response.text()

  return parseMusicLibrary(decodeMusicLibrary(encoded))
}
