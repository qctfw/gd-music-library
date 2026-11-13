<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useStore } from '@nanostores/vue'

import { artists, tags } from '../../stores/music-library'
import { MusicPlatformMeta } from '../../types/music-platform'
import { artistIds, tagIds, musicPlatformId, onlyNewSongs } from '../../stores/filter'

import SearchSelect from '../SearchSelect.vue'

const emit = defineEmits<{
    (e: 'close'): void
}>()

const $artists = useStore(artists)
const $tags = useStore(tags)

const selectArtist = ref(artistIds.get())
const selectTag = ref(tagIds.get())
const selectMusicPlatform = ref(musicPlatformId.get())
const checkboxOnlyNewSongs = ref(onlyNewSongs.get())
const dialog = useTemplateRef<HTMLElement>('dialog')
let previouslyFocusedElement: HTMLElement | null = null

const artistOptions = computed(() => Array.from($artists.value.entries()).sort((a, b) => {
    const aC = a[1].name.toLocaleLowerCase()
    const bC = b[1].name.toLocaleLowerCase()

    if (aC < bC) return -1
    else if (aC > bC) return 1
    return 0
}))

const tagOptions = computed(() => Array.from($tags.value.entries()).sort((a, b) => {
    const aC = a[1].name.toLocaleLowerCase()
    const bC = b[1].name.toLocaleLowerCase()

    if (aC < bC) return -1
    else if (aC > bC) return 1
    return 0
}))

watch(selectArtist, (value) => {
    artistIds.set(value)
})

watch(selectTag, (value) => {
    tagIds.set(value)
})

watch(selectMusicPlatform, (value) => {
    musicPlatformId.set(value)
})

watch(checkboxOnlyNewSongs, (value) => {
    onlyNewSongs.set(value)
})

onMounted(() => {
    previouslyFocusedElement = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
})

onBeforeUnmount(() => {
    previouslyFocusedElement?.focus()
})

function handleDialogKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        if (event.defaultPrevented) return
        emit('close')
        return
    }

    if (event.key !== 'Tab' || !dialog.value) return

    const focusableElements = Array.from(dialog.value.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )).filter(element => element.getClientRects().length > 0)

    if (focusableElements.length === 0) {
        event.preventDefault()
        dialog.value.focus()
        return
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey && (document.activeElement === firstElement || !dialog.value.contains(document.activeElement))) {
        event.preventDefault()
        lastElement.focus()
    } else if (!event.shiftKey && (document.activeElement === lastElement || !dialog.value.contains(document.activeElement))) {
        event.preventDefault()
        firstElement.focus()
    }
}

</script>

<template>
    <aside ref="dialog" class="fixed inset-0 flex items-center justify-center w-[100dvw] h-[100dvh] bg-slate-900 bg-opacity-35" role="dialog" aria-modal="true" aria-labelledby="filter-modal-title" tabindex="-1" @keydown="handleDialogKeydown">
        <div class="w-4/5 xl:w-1/2 relative flex flex-col gap-8 items-center p-8 bg-slate-800 rounded-lg shadow-[0_10px_20px_5px_rgba(0,0,0,0.5)]">
            <button type="button" class="absolute -top-4 -right-4 flex items-center justify-center size-12 bg-teal-700 rounded-full hover:bg-red-700" aria-label="Close filters" @click="emit('close')">
                <span class="icon icon-rounded text-3xl" aria-hidden="true">close</span>
            </button>
            <h3 id="filter-modal-title" class="text-3xl lg:text-4xl font-black text-center text-teal-200">Filters</h3>
            <div class="w-full flex flex-col gap-y-3">
                <div class="flex flex-col gap-y-1">
                    <span class="text-base lg:text-lg font-semibold">Artists</span>
                    <SearchSelect
                        v-model="selectArtist"
                        class="w-full"
                        label="Search artists..."
                        :options="artistOptions.map(([value, artist]) => ({ value, label: artist.name, item: artist }))"
                        multiple
                    />
                </div>
                <div class="flex flex-col gap-y-1">
                    <span class="text-base lg:text-lg font-semibold">Tags</span>
                    <SearchSelect
                        v-model="selectTag"
                        class="w-full"
                        label="Search tags..."
                        :options="tagOptions.map(([value, tag]) => ({ value, label: tag.name, item: tag }))"
                        multiple
                    />
                </div>
                <div class="flex flex-col gap-y-1">
                    <span class="text-base lg:text-lg font-semibold">Music Platform</span>
                    <SearchSelect
                        v-model="selectMusicPlatform"
                        class="w-full"
                        label="Search music platform..."
                        :options="Object.entries(MusicPlatformMeta).map(([value, platform]) => ({ value, label: platform.name.toString(), item: platform }))"
                    >
                        <template #option="{ option, item }">
                            <div class="inline-flex flex-row items-center gap-x-3">
                                <img :src="item.image.src" class="max-w-12 max-h-6" :alt="item.name + ' Icon'" />
                                <span v-text="option.label"></span>
                            </div>
                        </template>
                    </SearchSelect>
                </div>
                <div class="w-fit flex flex-col gap-y-1">
                    <label class="inline-flex flex-row items-center gap-x-2">
                        <input type="checkbox" class="hidden" v-model="checkboxOnlyNewSongs" />
                        <span class="icon icon-rounded icon-filled select-none text-teal-300" v-text="checkboxOnlyNewSongs ? 'check_box' : 'check_box_outline_blank'"></span>
                        <span>Only show new songs</span>
                    </label>
                </div>
            </div>
        </div>
    </aside>
</template>
