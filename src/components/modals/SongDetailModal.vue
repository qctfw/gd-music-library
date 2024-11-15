<script setup lang="ts">
import { filesize } from 'filesize'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useStore } from '@nanostores/vue'

import { songs, artists, tags } from '../../stores/music-library'

import YouTubeLogo from '../../assets/images/youtube.webp'
import NCSLogo from '../../assets/images/ncs.png'

const props = defineProps<{
    id: number,
}>()

const emit = defineEmits<{
    (e: 'close'): void
}>()

const idCopied = ref(false)

onMounted(() => {
    window.addEventListener('keydown', keyDownEvents)
})

onUnmounted(() => {
    window.removeEventListener('keydown', keyDownEvents)
})

const $songs = useStore(songs)
const $artists = useStore(artists)
const $tags = useStore(tags)

const song = computed(() => {
    if (props.id <= 0) {
        return null
    }
    
    const song = $songs.value.get(props.id)

    if (! song) {
        return null
    }
    const artistIds = song.artistId ? [song.artistId, ...(song.extraArtistIds || [])] : []
    const artists = artistIds.map(id => $artists.value.get(id))

    const tagIds = song.tagIds ?? null
    const tags = tagIds.map(id => $tags.value.get(id))

    return {
        id: song.id,
        name: song.name,
        artists: artists,
        filesize: filesize(song.filesize),
        duration: formatDuration(song.duration),
        tags: tags,
        musicPlatform: song.musicPlatform,
        url: song.url,
        isNew: song.isNew,
        priorityOrder: song.priorityOrder,
        songNumber: song.songNumber,
    }
})

const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60

    return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0')
}

const onClickSongId = () => {
    navigator.clipboard.writeText(props.id.toString())
        .then(() => {
            idCopied.value = true
            setTimeout(() => idCopied.value = false, 1500)
        })
        .catch(() => {
            console.error('Failed to copy to clipboard')
        })
}

const keyDownEvents = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
        emit('close')
    }
}
</script>

<template>
    <aside class="fixed inset-0 flex items-center justify-center w-[100dvw] h-[100dvh] bg-slate-900 bg-opacity-35" role="dialog" aria-modal="true">
        <div class="w-4/5 xl:w-1/2 relative flex flex-col gap-8 items-center p-8 bg-slate-800 rounded-lg shadow-[0_10px_20px_5px_rgba(0,0,0,0.5)]">
            <button class="absolute -top-4 -right-4 flex items-center justify-center size-12 bg-teal-700 rounded-full hover:bg-red-700" @click="emit('close')">
                <span class="icon icon-rounded text-3xl">close</span>
            </button>
            <h3 class="text-2xl md:text-3xl xl:text-4xl font-black text-center text-teal-200" v-text="song?.name"></h3>
            <div class="flex flex-col gap-2 items-center">
                <div v-for="artist of song?.artists" class="flex flex-row items-center gap-2">
                    <p class="text-lg md:text-xl 2xl:text-2xl font-semibold">{{ artist?.name }}</p>
                    <div v-if="artist?.website || artist?.youtubeUrl" class="flex flex-row items-center gap-2">
                        <a v-if="artist?.website" :href="artist?.website?.href" rel="nofollow noreferrer" target="_blank" class="inline-flex items-center hover:text-teal-200 transition-colors"><span class="icon icon-filled">globe</span></a>
                        <a v-if="artist?.youtubeUrl" :href="artist?.youtubeUrl?.href" rel="nofollow noreferrer" target="_blank" class="inline-flex items-center"><img :src="YouTubeLogo.src" class="w-8" alt="YouTube Icon" /></a>
                    </div>
                </div>
            </div>
            <div v-if="song?.musicPlatform === 1" class="flex flex-col items-center gap-1">
                <a href="https://ncs.io" target="_blank" rel="nofollow noreferrer"><img :src="NCSLogo.src" class="w-16 lg:w-20" alt="NoCopyrightSounds Logo" /></a>
                <span class="text-sm md:text-base">This song is by <a href="https://ncs.io" target="_blank" rel="nofollow noreferrer" class="text-teal-300 hover:text-teal-100 underline decoration-dashed hover:decoration-solid transition-colors">NoCopyrightSounds <span class="icon icon-rounded text-sm">open_in_new</span></a></span>
            </div>
            <p class="lg:text-lg text-center" v-text="song?.tags.map(tag => tag?.name).join(', ')"></p>
            <a v-if="song?.url" :href="song.url" rel="noopener noreferrer" target="_blank" class="border-2 border-teal-700 hover:bg-teal-700 text-teal-100 px-5 py-2 rounded">Download Soundtrack <span class="icon icon-rounded text-base">open_in_new</span></a>
            <p>{{ song?.duration }} &bull; {{ song?.filesize }} &bull; <button class="text-teal-300 hover:text-teal-100 underline underline-offset-4 decoration-dashed hover:decoration-solid transition-colors" v-text="'#' + id" @click="onClickSongId"></button></p>
            <div v-if="idCopied" class="absolute bg-teal-950 text-teal-200 px-4 py-2 rounded" style="top:102%;">Song ID has been copied to clipboard</div>
        </div>
    </aside>
</template>