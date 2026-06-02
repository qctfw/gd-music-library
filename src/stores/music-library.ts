import { decompressSync } from 'fflate'
import { atom } from 'nanostores'
import { isMusicPlatform, MusicPlatform } from '../types/music-platform'
import type { Artist, Song, Tag } from '../types/song'

export const version = atom(0)
export const artists = atom<Map<number, Artist>>(new Map())
export const songs = atom<Map<number, Song>>(new Map())
export const tags = atom<Map<number, Tag>>(new Map())

export const libraryFile = '146-b9d4c937a16217654d1ee9dddf0e9e6dcf94610c8f9635f88307c5b45f1b5749.txt'

export const latestMusicLibraryVersion = 146

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
            artists.set(processArtistPart(data))
            break
        case 2:
            songs.set(processSongPart(data))
            break
        case 3:
            tags.set(processTagPart(data))
            break
        default:
            console.error('Unknown Data Part')
            break
    }
}

function processArtistPart(data: String): Map<number, Artist> {
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
        });
    })

    return result
}

function processSongPart(data: String): Map<number, Song> {
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
        })
    })

    return result
}

function processTagPart(data: String): Map<number, Tag> {
    const result: Map<number, Tag> = new Map()
    const tagArray = data.split(';')

    tagArray.forEach(value => {
        if (value.trim().length <= 0) {
            return
        }

        const arrayData = value.split(',')
        const tagId = Number(arrayData[0])
        const tagName = arrayData[1]

        result.set(tagId, {
            id: tagId,
            name: tagName,
        })
    })

    return result
}