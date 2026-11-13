import { decompressSync } from 'fflate'
import { atom } from 'nanostores'
import { isMusicPlatform, MusicPlatform } from '../types/music-platform'
import type { Artist, ExternalLink, Song, Tag } from '../types/song'
import { ExternalLinkType, ExternalLinkTypeMeta, isExternalLinkType } from '../types/external-link'

export const version = atom(0)
export const artists = atom<Map<number, Artist>>(new Map())
export const songs = atom<Map<number, Song>>(new Map())
export const tags = atom<Map<number, Tag>>(new Map())

export const libraryFile = '149-3bdcfa6f196c94fb7d60bea8197978466bb437bae6958af4c674686d4b6a2926.txt'

export const latestMusicLibraryVersion = 149

export const getMusicLibraryData = async (): Promise<Uint8Array> => {
  const versionFile = libraryFile

  return fetch('/datas/music-library/' + versionFile)
    .then(res => res.text())
    .then(res => {
      const result = atob(res.replace(/-/g, '+').replace(/_/g, '/'))

      const bytes = new Uint8Array(result.length).map((_, index) => result.charCodeAt(index))

      return bytes
    })
    .then(res => decompressSync(res))
}

export const processMusicLibraryData = (rawData: Uint8Array) => {
  const text = new TextDecoder().decode(rawData)

  text.split('|').forEach((part, index) => processPart(part, index))
}

function processPart(data: String, partIndex: number) {
  switch (partIndex) {
    case 0:
      version.set(Number(data))
      break
    case 1:
      processArtistPart(data)
      break
    case 2:
      processSongPart(data)
      break
    case 3:
      processTagPart(data)
      break
    case 4:
      // TODO: Changelog
      break
    case 5:
      // Song Links
      processSongLinkPart(data)
      break
    case 6:
      // Artist Links
      processArtistLinkPart(data)
      break
    default:
      console.error('Unknown Data Part')
      break
  }
}

function processArtistPart(data: String) {
  const result: Map<number, Artist> = new Map()
  const artistArray = data.split(';')

  artistArray.forEach(value => {
    if (value.trim().length <= 0) {
      return
    }

    const arrayData = value.split(',')
    const artistId = Number(arrayData[0])
    const artistName = arrayData[1]
    const artistWebsite = arrayData[2].trim()
    const artistYouTubeId = arrayData[3].trim()

    result.set(artistId, {
      id: artistId,
      name: artistName,
      website: artistWebsite.length > 0 ? new URL(decodeURIComponent(artistWebsite)) : null,
      youtubeUrl: artistYouTubeId.length > 0 ? new URL('https://www.youtube.com/channel/' + artistYouTubeId) : null,
      links: [],
    });
  })

  artists.set(result)
}

function processSongPart(data: String) {
  const result: Map<number, Song> = new Map()
  const songArray = data.split(';')

  songArray.forEach(value => {
    if (value.trim().length <= 0) {
      return
    }

    const arrayData = value.replace(/(\r\n|\n|\r)/gm, '').split(',')
    const songId = Number(arrayData[0])
    const songName = arrayData[1].trim()
    const artistId = Number(arrayData[2])
    const songFilesize = Number(arrayData[3])
    const songDuration = Number(arrayData[4])
    const songTags = arrayData[5] && arrayData[5] !== '.' ? arrayData[5].replace(/^\.|\.$/g, '').split('.').map(v => Number(v)) : []

    const musicPlatformValue = Number(arrayData[6])
    const musicPlatform = isMusicPlatform(musicPlatformValue) ? musicPlatformValue : MusicPlatform.None

    const extraArtistIds = arrayData[7] ? arrayData[7].split('.').map(v => Number(v)) : []
    const songUrl = decodeURIComponent(arrayData[8]).replace(/\?.+/g, '')
    const isNewSong = Boolean(arrayData[9])
    const songPriorityOrder = Number(arrayData[10])
    const songnumber = Number(arrayData[11])

    result.set(songId, {
      id: songId,
      name: songName,
      searchName: songName.toLocaleLowerCase(),
      artistId: artistId,
      filesize: songFilesize,
      duration: songDuration,
      tagIds: songTags,
      musicPlatform: musicPlatform,
      extraArtistIds: extraArtistIds,
      url: songUrl && songUrl !== '://' ? songUrl : null,
      isNew: isNewSong,
      priorityOrder: songPriorityOrder,
      songNumber: songnumber,
      links: [],
    })
  })

  songs.set(result)
}

function processTagPart(data: String) {
  const result: Map<number, Tag> = new Map()
  const tagArray = data.split(';')

  tagArray.forEach(value => {
    if (value.trim().length <= 0) {
      return
    }

    const arrayData = value.split(',')
    const tagId = Number(arrayData[0])
    const tagName = arrayData[1].replace(/\p{L}+/gu, word => word.charAt(0).toLocaleUpperCase() + word.slice(1).toLocaleLowerCase())

    result.set(tagId, {
      id: tagId,
      name: tagName,
    })
  })

  tags.set(result)
}

function processSongLinkPart(data: String) {
  const songLinkArray = data.split(';')

  const parsedData = parseExternalLinkData(songLinkArray)

  const result = songs.get()

  parsedData.forEach((links, songs) => {
    const currentSong = result.get(songs)

    if (!currentSong) {
      return
    }

    currentSong.links = links

    result.set(songs, currentSong)
  })

  songs.set(result)
}

function processArtistLinkPart(data: String) {
  const artistLinkArray = data.split(';')

  const parsedData = parseExternalLinkData(artistLinkArray)

  const result = artists.get()

  parsedData.forEach((links, artistId) => {
    const currentArtist = result.get(artistId)

    if (!currentArtist) {
      return
    }

    currentArtist.links = links

    result.set(artistId, currentArtist)
  })

  artists.set(result)
}

function parseExternalLinkData(data: String[]): Map<number, ExternalLink[]> {
  const result: Map<number, ExternalLink[]> = new Map()

  data.forEach(value => {
    if (value.trim().length <= 0) {
      return;
    }

    const arrayData = value.replace(/(\r\n|\n|\r)/gm, '').split(',')

    const dataId = Number(arrayData[0])
    const customTitle = arrayData[2] ? decodeURIComponent(arrayData[2]).trim() : ''
    const typeValue = (isExternalLinkType(arrayData[1]) ? Number(arrayData[1]) : ExternalLinkType.Website) as ExternalLinkType
    const externalUrl = new URL(decodeURIComponent(arrayData[3]))

    const currentLinks = result.get(dataId) ?? []

    currentLinks.push({
      title: customTitle.length > 0 ? customTitle : ExternalLinkTypeMeta[typeValue].name,
      typeId: typeValue,
      url: externalUrl,
    })

    result.set(dataId, currentLinks)
  })

  return result;
}
