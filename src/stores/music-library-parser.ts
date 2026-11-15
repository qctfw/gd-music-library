import { decompressSync } from 'fflate'
import { Base64 } from 'js-base64'

import type { ChangelogMetadata } from '../types/changelog'
import { ExternalLinkType, ExternalLinkTypeMeta, isExternalLinkType } from '../types/external-link'
import { isMusicPlatform, MusicPlatform } from '../types/music-platform'
import type { Artist, ExternalLink, Song, Tag } from '../types/song'

export type MusicLibraryData = {
  version: number
  artists: Map<number, Artist>
  songs: Map<number, Song>
  tags: Map<number, Tag>
  changelogs: Map<number, ChangelogMetadata>
}

export type MusicLibraryWorkerRequest = {
  url: string
}

export type MusicLibraryWorkerResponse = {
  ok: true
  data: MusicLibraryData
} | {
  ok: false
  error: string
}

export function decodeMusicLibrary(encoded: string): Uint8Array {
  return decompressSync(Base64.toUint8Array(encoded))
}

export function parseMusicLibrary(rawData: Uint8Array): MusicLibraryData {
  const parts = new TextDecoder().decode(rawData).split('|')

  const version = Number(parts[0])
  const artists = processArtistPart(parts[1] ?? '')
  const songs = processSongPart(parts[2] ?? '')
  const tags = processTagPart(parts[3] ?? '')
  const changelogs = processChangelogPart(parts[4] ?? '')

  applyLinks(songs, parseExternalLinkData(parts[5] ?? ''))
  applyLinks(artists, parseExternalLinkData(parts[6] ?? ''))

  return { version, artists, songs, tags, changelogs }
}

function processArtistPart(data: string): Map<number, Artist> {
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
      website: artistWebsite.length > 0 ? decodeURIComponent(artistWebsite) : null,
      youtubeUrl: artistYouTubeId.length > 0 ? 'https://www.youtube.com/channel/' + artistYouTubeId : null,
      links: [],
    });
  })

  return result
}

function processSongPart(data: string): Map<number, Song> {
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
    const isNewSong = arrayData[9] == '1'
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

  return result
}

function processTagPart(data: string): Map<number, Tag> {
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

  return result
}

function processChangelogPart(data: string): Map<number, ChangelogMetadata> {
  const parsedData = Base64.decode(data.toString())

  const result: Map<number, ChangelogMetadata> = new Map()

  parsedData.split('$').forEach(value => {
    if (value.trim().length <= 0) {
      return
    }

    const [metadataData, changesData] = value.split(':', 2)

    if (!metadataData || !changesData) {
      return
    }

    const [changelogVersion, timestamp, highestSongId] = metadataData.split(',', 3).map(Number)

    const changes = changesData.split(';').map(change => {
        const [artistId, tags, changesCount] = change.split('~')

        return {
            artistId: Number(artistId),
            tags: tags ? tags.split('.').map(Number) : [],
            count: Number(changesCount),
        }
    })

    result.set(changelogVersion, {
      version: changelogVersion,
      timestamp: timestamp,
      highestSongId: highestSongId,
      changes: changes,
    })
  })

  return result
}

function parseExternalLinkData(data: string): Map<number, ExternalLink[]> {
  const dataArray = data.split(';')

  const result: Map<number, ExternalLink[]> = new Map()

  dataArray.forEach(value => {
    if (value.trim().length <= 0) {
      return
    }

    const arrayData = value.replace(/(\r\n|\n|\r)/gm, '').split(',')

    const dataId = Number(arrayData[0])
    const typeValue = (isExternalLinkType(arrayData[1]) ? Number(arrayData[1]) : ExternalLinkType.Website) as ExternalLinkType
    const customTitle = arrayData[2] ? decodeURIComponent(arrayData[2]).trim() : ''
    const externalUrl = decodeURIComponent(arrayData[3])

    if (!externalUrl) {
      return
    }

    const currentLinks = result.get(dataId) ?? []

    currentLinks.push({
      title: customTitle.length > 0 ? customTitle : ExternalLinkTypeMeta[typeValue].name,
      typeId: typeValue,
      url: externalUrl,
    })

    result.set(dataId, currentLinks)
  })

  return result
}

function applyLinks<T extends { links: ExternalLink[] }>(records: Map<number, T>, links: Map<number, ExternalLink[]>): void {
  links.forEach((recordLinks, id) => {
    const record = records.get(id)

    if (record) {
      record.links = recordLinks
    }
  })
}
