<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useStore } from '@nanostores/vue';
import { artists, tags } from '../stores/music-library';
import { query, artistIds, tagIds, musicPlatformId } from '../stores/filter'

const $artists = useStore(artists)
const $tags = useStore(tags)

const searchQuery = ref('')
const selectArtist = ref('')
const selectTag = ref('')
const selectMusicPlatform = ref('')

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

watch(searchQuery, (value) => {
    query.set(value.trim().toLocaleLowerCase())
})

watch(selectArtist, (value) => {
    if (value.length <= 0) {
        artistIds.set([])
        return
    }

    artistIds.set([+value])
})

watch(selectTag, (value) => {
    if (value.length <= 0) {
        tagIds.set([])
        return
    }

    tagIds.set([+value])
})

watch(selectMusicPlatform, (value) => {
    musicPlatformId.set(value)
})

function resetSearch() {
    searchQuery.value = ''
}
</script>

<template>
    <div class="flex flex-col gap-2">
        <div class="relative flex items-center w-full h-12 rounded-lg overflow-hidden border-2 border-teal-600 focus-within:bg-teal-800/50 transition-colors">
            <div class="flex items-center h-full w-12 ps-3 text-teal-300">
                <span class="icon icon-rounded select-none">search</span>
            </div>
            <input v-model="searchQuery" class="form-input h-full w-full outline-none text-teal-100 placeholder:text-teal-500 placeholder:italic border-transparent bg-transparent pr-2 focus:border-0 focus:ring-0" placeholder="Search songs..." />
            <button class="flex items-center h-full w-12 text-teal-300" @click="resetSearch">
                <span class="icon icon-rounded">close</span>
            </button>
        </div>
        <div class="grid grid-cols-3 gap-2 justify-between max-w-full">
            <select v-model="selectArtist" class="form-select bg-transparent border-2 border-teal-600 text-teal-200 rounded">
                <option value="" class="bg-teal-900">(All Artists)</option>
                <option v-for="[artistId, artist] in artistOptions" :value="artistId" class="bg-teal-900" v-text="artist.name"></option>
            </select>
            <select v-model="selectTag" class="form-select bg-transparent border-2 border-teal-600 text-teal-200 rounded">
                <option value="" class="bg-teal-900">(All Tags)</option>
                <option v-for="[tagId, tag] in tagOptions" :value="tagId" class="bg-teal-900" v-text="tag.name"></option>
            </select>
            <select v-model="selectMusicPlatform" class="form-select bg-transparent border-2 border-teal-600 text-teal-200 rounded">
                <option value="" class="bg-teal-900">(All Music Platforms)</option>
                <option value="0" class="bg-teal-900">(No Music Platforms)</option>
                <option value="1" class="bg-teal-900">NCS</option>
            </select>
        </div>
    </div>
</template>