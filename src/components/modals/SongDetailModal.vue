<script setup lang="ts">
import { filesize } from 'filesize'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useStore } from '@nanostores/vue'

import { songs, artists, tags } from '../../stores/music-library'

import { MusicPlatform, MusicPlatformMeta } from '../../types/music-platform'
import { ExternalLinkType, ExternalLinkTypeMeta } from '../../types/external-link'

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
        ...song,
        artists: artists,
        filesize: filesize(song.filesize),
        duration: formatDuration(song.duration),
        tags: tags,
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
    <aside class="fixed inset-0 flex items-center justify-center w-dvw h-dvh bg-slate-900/35" role="dialog" aria-modal="true">
        <div class="w-4/5 xl:w-1/2 relative flex flex-col gap-8 items-center p-8 bg-slate-800 rounded-lg shadow-[0_10px_20px_5px_rgba(0,0,0,0.5)]">
            <button class="absolute -top-4 -right-4 flex items-center justify-center size-12 bg-teal-700 rounded-full hover:bg-red-700" @click="emit('close')">
                <span class="icon icon-rounded text-3xl">close</span>
            </button>
            <h3 class="text-2xl md:text-3xl xl:text-4xl font-black text-center text-teal-200" v-text="song?.name"></h3>
            <div class="flex flex-col gap-1 items-center">
                <h4 class="text-lg md:text-xl xl:text-2xl font-semibold text-center text-teal-200" v-text="(song?.artists?.length ?? 0) > 1 ? 'Artists' : 'Artist'"></h4>
                <div v-for="artist of song?.artists" class="flex flex-col items-center gap-1">
                    <p class="text-lg md:text-xl 2xl:text-2xl font-semibold">{{ artist?.name }}</p>
                    <div v-if="(artist?.links?.length ?? 0) > 0" class="flex flex-row flex-wrap items-center justify-center gap-x-2 gap-y-1">
                        <a v-for="linkData in artist?.links" :href="linkData.url.href" :title="artist?.name + '\'s ' + linkData.title" rel="noopener noreferrer" target="_blank" class="flex flex-row gap-x-2 items-center border-2 border-teal-700 hover:bg-teal-700 text-teal-100 px-3 py-1.5 rounded">
                            <span v-if="linkData.typeId === ExternalLinkType.Website" class="icon icon-filled">globe</span>
                            <img v-else :src="ExternalLinkTypeMeta[linkData.typeId].logoUrl?.src" class="h-6" :alt="linkData.title + ' Icon'" />
                            <span v-text="linkData.title"></span>
                        </a>
                    </div>
                </div>
            </div>
            <div v-if="(song?.links?.length ?? 0) > 0" class="flex flex-col gap-1">
                <h4 class="text-lg md:text-xl xl:text-2xl font-semibold text-center text-teal-200">Listen / Download</h4>
                <div class="flex flex-row flex-wrap items-center justify-center gap-x-2 gap-y-1">
                    <a v-for="linkData in song?.links" :href="linkData.url.href" :title="linkData.title" rel="noopener noreferrer" target="_blank" class="flex flex-row gap-x-2 items-center border-2 border-teal-700 hover:bg-teal-700 text-teal-100 px-3 py-1.5 rounded">
                        <span v-if="linkData.typeId === ExternalLinkType.Website" class="icon icon-filled">globe</span>
                        <img v-else :src="ExternalLinkTypeMeta[linkData.typeId].logoUrl?.src" class="h-6" :alt="linkData.title + ' Icon'" />
                        <span v-text="linkData.title"></span>
                    </a>
                </div>
            </div>
            <div v-if="(song?.musicPlatform ?? MusicPlatform.None) !== MusicPlatform.None" class="flex flex-col items-center gap-1">
                <a :href="MusicPlatformMeta[song?.musicPlatform ?? MusicPlatform.None].site.href" target="_blank" rel="nofollow noreferrer"><img :src="MusicPlatformMeta[song?.musicPlatform ?? MusicPlatform.None].image.src" class="w-16 lg:w-20" :alt="MusicPlatformMeta[song?.musicPlatform ?? MusicPlatform.None].name + 'Logo'" /></a>
                <span class="text-sm md:text-base text-center">This music is provided by <a :href="MusicPlatformMeta[song?.musicPlatform ?? MusicPlatform.None].site.href" target="_blank" rel="nofollow noreferrer" class="text-teal-300 hover:text-teal-100 underline underline-offset-4 decoration-dashed hover:decoration-solid transition-colors">{{ MusicPlatformMeta[song?.musicPlatform ?? MusicPlatform.None].name }} <span class="icon icon-rounded text-sm" style="--ms-optical-size:16;">open_in_new</span></a></span>
            </div>
            <div class="flex flex-col items-center gap-y-1">
                <p v-if="(song?.tags?.length ?? 0) > 0" class="text-sm lg:text-sm text-center" v-text="song?.tags.map(tag => tag?.name).join(', ')"></p>
                <p>{{ song?.duration }} &bull; {{ song?.filesize }} &bull; <button class="text-teal-300 hover:text-teal-100 underline underline-offset-4 decoration-dashed hover:decoration-solid transition-colors" v-text="'#' + id" @click="onClickSongId"></button></p>
            </div>
            <div v-if="idCopied" class="absolute bg-teal-500 text-teal-950 font-semibold px-4 py-2 rounded" style="top:102%;">Song ID has been copied to clipboard</div>
        </div>
    </aside>
</template>
