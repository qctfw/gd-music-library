<script setup lang="ts">
import { ref, watch, useTemplateRef, nextTick } from 'vue'

import { query } from '../stores/filter'

import FilterModal from './modals/FilterModal.vue'

const filterModalShowed = ref(false)
const searchQuery = ref('')
const filterBtn = useTemplateRef('filterBtn')

let queryDebounce: ReturnType<typeof setTimeout> | undefined

watch(searchQuery, (value) => {
    clearTimeout(queryDebounce)
    queryDebounce = setTimeout(() => {
        query.set(value.trim().toLocaleLowerCase())
    }, 200)
})

function resetSearch() {
    searchQuery.value = ''
}

function onFilterButtonClick() {
    filterBtn.value?.blur()
    filterModalShowed.value = true
}
</script>

<template>
    <div class="flex flex-row gap-2">
        <div class="relative flex flex-grow items-center w-full h-12 rounded-lg overflow-hidden border-2 border-teal-600 focus-within:bg-teal-800/50 transition-colors">
            <div class="flex items-center h-full w-12 ps-3 text-teal-300">
                <span class="icon icon-rounded select-none">search</span>
            </div>
            <input v-model="searchQuery" class="form-input h-full w-full outline-none text-teal-100 placeholder:text-teal-500 placeholder:italic border-transparent bg-transparent pr-2 focus:border-0 focus:ring-0" placeholder="Search songs..." />
            <button class="flex items-center justify-center h-full w-12 text-teal-300 hover:bg-teal-600 hover:text-teal-100" @click="resetSearch">
                <span class="icon icon-rounded">close</span>
            </button>
        </div>
        <button ref="filterBtn" class="flex items-center justify-center w-12 text-teal-300 border-2 border-teal-600 rounded-lg hover:bg-teal-600 hover:text-teal-100" @click="onFilterButtonClick">
            <span class="icon icon-rounded">filter_alt</span>
        </button>
        <FilterModal
            v-if="filterModalShowed"
            @close="filterModalShowed = false"
        />
    </div>
</template>
