import { decompressSync } from 'fflate'
import { atom } from 'nanostores'

export const version = atom(0)
export const artists = atom<Map<number, Artist>>(new Map())
export const songs = atom<Map<number, Song>>(new Map())
export const tags = atom<Map<number, Tag>>(new Map())

export const musicLibraryVersion: { [key: number]: string } = {
    127: '127-2d0f36af2ff8ed7b26ac99573f03e57ba3929c0c762ed6eff7cec10aafdd330d.txt',
    129: '129-029fd0860dfec8fa536722b15650258794e747abf5baa7b2b010b7fbd2643261.txt',
    130: '130-a1679b35ed19fc8a9e62ee2488a0378ec0522374b39db757a27a7644da90592b.txt',
}

export const latestMusicLibraryVersion = 130

export const getMusicLibraryData = async (selectedVersion: number): Promise<Uint8Array> => {
    const versionFile = musicLibraryVersion[selectedVersion]

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
    let currentPart = 0
    let currentString = ''
    
    for (const charCode of rawData) {
        if (charCode == 124) {
            processPart(currentString, currentPart)
    
            currentPart++
            currentString = ''
            continue
        }

        const char = String.fromCharCode(charCode)
        currentString += char
    }
    
    if (currentString) {
        processPart(currentString, currentPart)
    }
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

        // Workaround temp fix for malformed data
        if (value.startsWith('10009950')) {
            value = value.replace('(ft. Malou,', '(ft. Malou﹐')
        }

        const arrayData = value.replace(/(\r\n|\n|\r)/gm, '').split(',')
        const songId = Number(arrayData[0])
        const songName = arrayData[1].trim()
        const artistId = Number(arrayData[2])
        const songFilesize = Number(arrayData[3])
        const songDuration = Number(arrayData[4])
        const songTags = arrayData[5] && arrayData[5] !== '.' ? arrayData[5].replace(/^\.|\.$/g, '').split('.').map(v => Number(v)) : []
        const songPlatform = arrayData[6] ? Number(arrayData[6]) : MusicPlatform.None
        const extraArtistIds = arrayData[7] ? arrayData[7].split('.').map(v => Number(v)) : []
        const songUrl = decodeURIComponent(arrayData[8]).replace(/\?.+/g, '')
        const isNewSong = Boolean(arrayData[9])
        const songPriorityOrder = Number(arrayData[10])
        const songnumber = Number(arrayData[11])

        result.set(songId, {
            id: songId,
            name: songName,
            artistId: artistId,
            filesize: songFilesize,
            duration: songDuration,
            tagIds: songTags,
            musicPlatform: songPlatform,
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