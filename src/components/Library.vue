<script setup lang="ts">
import { decompressSync } from 'fflate'
import { filesize } from 'filesize'
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from '@nanostores/vue'

import { version, artists, songs, tags, processMusicLibraryData } from '../stores/music-library'
import { query, artistIds, tagIds, musicPlatformId } from '../stores/filter'

import SongDetailModal from './modals/SongDetailModal.vue'

import NCSLogo from '../assets/images/ncs.png'

const $version = useStore(version)
const $artists = useStore(artists)
const $songs = useStore(songs)
const $tags = useStore(tags)

const $query = useStore(query)
const $artistQuery = useStore(artistIds)
const $tagQuery = useStore(tagIds)
const $musicPlatformQuery = useStore(musicPlatformId)

const songArray = computed(() => Array.from($songs.value.entries()).filter((value) => {
    if ($query.value.trim().length > 0 && ! value[1].name.toLocaleLowerCase().includes($query.value)) {
        return false
    }

    if ($musicPlatformQuery.value.length > 0 && value[1].musicPlatform !== +$musicPlatformQuery.value) {
        return false
    }

    if ($artistQuery.value.length > 0 && $artistQuery.value.filter(v => [value[1].artistId, ...value[1].extraArtistIds].includes(v)).length <= 0) {
        return false
    }

    if ($tagQuery.value.length > 0 && $tagQuery.value.filter(v => value[1].tagIds.includes(v)).length <= 0) {
        return false
    }
    
    return true
}))

const itemsPerPage = 14
const currentPage = ref(1)
const pageInput = ref('')
const totalPages = computed(() => Math.ceil(songArray.value.length / itemsPerPage))
const selectedSongId = ref(0)
const hasError = ref(false)

const paginatedSongData = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    return songArray.value.slice(start, start + itemsPerPage)
})

watch([$query, $artistQuery, $tagQuery], () => {
    currentPage.value = 1
})

onMounted(() => {
    if ($songs.value.size <= 0) {
        getMusicLibraryData()
            .then(data => processMusicLibraryData(data))
            .catch(error => {
                hasError.value = true
                console.error(error)
            })
    }
})

async function getMusicLibraryData() {
    const defaultVersion = 127
    const rawData = await fetch('/api/music-library/' + defaultVersion).then(res => res.arrayBuffer())

    return decompressSync(new Uint8Array(rawData))
}

const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60

    return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0')
}

const getTagNames = (ids: number[]) => {
    const result: String[] = []

    ids.forEach(id => {
        const tag = $tags.value.get(id)

        if (tag) {
            result.push(tag.name)
        }
    })

    return result
}

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
    }
}

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--
    }
}

const onSubmitPageInput = (event: Event) => {
    event.preventDefault()

    let input = Number(pageInput.value)

    if (input <= 0) {
        input = 1
    }
    else if (input >= totalPages.value) {
        input = totalPages.value
    }

    currentPage.value = input
    pageInput.value = ''
}
</script>

<template>
    <div class="flex flex-col w-full h-full lg:w-11/12 xl:w-3/4 2xl:w-2/3 justify-between gap-2">
        <div v-if="$version > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div v-if="paginatedSongData.length > 0" v-for="[songId, song] of paginatedSongData" class="flex flex-row grow bg-teal-800/50 hover:bg-teal-700 rounded p-2 transition-colors">
                <div class="flex flex-col gap-2 justify-between grow">
                    <div class="flex flex-col">
                        <p class="text-lg xl:text-2xl text-teal-200 font-black" v-text="song.name"></p>
                        <p class="">
                            <span>{{ $artists.get(song.artistId)?.name }}</span>
                            <strong v-if="song.extraArtistIds.length > 0" v-text="' + ' + song.extraArtistIds.length"></strong>
                        </p>
                    </div>
                    <p class="text-xs">{{ formatDuration(song.duration) }} - {{ filesize(song.filesize) }} - <span :class="song.tagIds.length > 0 ? '' : 'italic'" v-text="song.tagIds.length > 0 ? getTagNames([...song.tagIds]).join(', ') : 'No tag'"></span></p>
                </div>
                <div class="flex flex-col justify-between text-end">
                    <div class="flex flex-col items-end w-full gap-1 text-xs">
                        <span>#{{ songId }}</span>
                        <img v-if="song.musicPlatform === 1" :src="NCSLogo.src" alt="NoCopyrightSounds Logo" class="w-8" />
                    </div>
                    <div class="">
                        <button class="icon icon-outlined hover:icon-filled" @click="selectedSongId = song.id">info</button>
                    </div>
                </div>
            </div>
            <div v-else class="col-span-full">
                <p class="italic text-center">No results</p>
            </div>
        </div>
        <div v-if="$version > 0" class="flex flex-row justify-between">
            <div class="flex flex-row flex-wrap gap-2">
                <p v-if="totalPages > 0">Page {{ currentPage }} / {{ totalPages }}</p>
                <p v-if="totalPages > 0">(Total: {{ songArray.length }} songs)</p>
                <p>Library Version: <strong>{{ $version }}</strong></p>
            </div>
            <div v-if="totalPages > 0" class="h-max flex flex-col md:flex-row gap-2">
                <form @submit.prevent="onSubmitPageInput">
                    <input v-model="pageInput" type="number" name="page" placeholder="Page" min="1" :max="totalPages" class="form-input w-full md:w-24 rounded bg-transparent border-teal-600 outline-none text-teal-100 placeholder:text-teal-500 placeholder:italic" />
                </form>
                <div class="flex flex-row gap-2">
                    <button class="border-2 border-teal-700 hover:bg-teal-700 text-teal-100 p-2 rounded" @click="prevPage">Previous</button>
                    <button class="border-2 border-teal-700 hover:bg-teal-700 text-teal-100 p-2 rounded" @click="nextPage">Next</button>
                </div>
            </div>
        </div>
        <div v-else-if="hasError" class="font-semibold">There is an error when fetching the music library data.</div>
        <div v-else class="font-semibold">Loading...</div>
    </div>
    <SongDetailModal v-if="selectedSongId > 0" :id="selectedSongId" @close="selectedSongId = 0" />
</template>