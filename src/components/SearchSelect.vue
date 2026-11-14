<script setup lang="ts" generic="TItem">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, useTemplateRef, watch } from 'vue'

type OptionValue = string | number

type SearchOption = {
    value: OptionValue
    label: string
    searchText?: string
    item: TItem
}

const props = withDefaults(defineProps<{
    modelValue?: OptionValue | OptionValue[]
    options: SearchOption[]
    label: string
    multiple?: boolean
}>(), {
    multiple: false,
})

const emit = defineEmits<{
    'update:modelValue': [value: OptionValue | OptionValue[]]
}>()

const id = useId()
const searchQuery = ref('')
const isOpen = ref(false)
const activeIndex = ref(-1)
const root = useTemplateRef<HTMLElement>('root')
const input = useTemplateRef<HTMLInputElement>('input')

const selectedValues = computed<OptionValue[]>(() => {
    if (props.multiple) {
        return Array.isArray(props.modelValue) ? props.modelValue : []
    }

    return props.modelValue == null || Array.isArray(props.modelValue) || props.modelValue === ''
        ? []
        : [props.modelValue]
})

const selectedOptions = computed(() => selectedValues.value
    .map(value => props.options.find(option => String(option.value) === String(value)))
    .filter((option): option is SearchOption => option !== undefined))

const filteredOptions = computed(() => {
    const query = searchQuery.value.trim().toLocaleLowerCase()
    if (!query) return props.options

    return props.options.filter(option =>
        (option.searchText ?? option.label).toLocaleLowerCase().includes(query),
    )
})

const listboxId = `${id}-options`
const activeOptionId = computed(() => activeIndex.value >= 0 && filteredOptions.value[activeIndex.value]
    ? `${id}-option-${activeIndex.value}`
    : undefined)

watch(filteredOptions, options => {
    if (options.length === 0) {
        activeIndex.value = -1
    } else if (activeIndex.value >= options.length) {
        activeIndex.value = options.length - 1
    }
})

function isSelected(option: SearchOption) {
    return selectedValues.value.some(value => String(value) === String(option.value))
}

function openList() {
    isOpen.value = true
    if (activeIndex.value < 0 && filteredOptions.value.length > 0) {
        activeIndex.value = 0
    }
}

function focusActiveOption() {
    const optionId = activeOptionId.value
    if (!optionId) return

    nextTick(() => document.getElementById(optionId)?.scrollIntoView?.({ block: 'nearest' }))
}

function moveActiveOption(direction: number) {
    if (!isOpen.value) {
        openList()
        return
    }

    const length = filteredOptions.value.length
    if (length === 0) return

    activeIndex.value = (activeIndex.value + direction + length) % length
    focusActiveOption()
}

function selectOption(option: SearchOption) {
    if (props.multiple) {
        const next = isSelected(option)
            ? selectedValues.value.filter(value => String(value) !== String(option.value))
            : [...selectedValues.value, option.value]
        emit('update:modelValue', next)
        return
    }

    emit('update:modelValue', option.value)
    isOpen.value = false
    searchQuery.value = ''
}


function removeOption(value: OptionValue) {
    if (props.multiple) {
        emit('update:modelValue', selectedValues.value.filter(item => String(item) !== String(value)))
    } else {
        emit('update:modelValue', '')
    }
}

function clearSelection() {
    emit('update:modelValue', props.multiple ? [] : '')
    searchQuery.value = ''
}

function onKeydown(event: KeyboardEvent) {
    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault()
            moveActiveOption(1)
            break
        case 'ArrowUp':
            event.preventDefault()
            moveActiveOption(-1)
            break
        case 'Enter':
            if (!isOpen.value) {
                event.preventDefault()
                openList()
            } else if (activeIndex.value >= 0 && filteredOptions.value[activeIndex.value]) {
                event.preventDefault()
                selectOption(filteredOptions.value[activeIndex.value])
            }
            break
        case 'Escape':
            if (isOpen.value) {
                event.preventDefault()
                isOpen.value = false
            }
            break
        case 'Tab':
            isOpen.value = false
            break
        case 'Home':
            if (isOpen.value && filteredOptions.value.length > 0) {
                event.preventDefault()
                activeIndex.value = 0
                focusActiveOption()
            }
            break
        case 'End':
            if (isOpen.value && filteredOptions.value.length > 0) {
                event.preventDefault()
                activeIndex.value = filteredOptions.value.length - 1
                focusActiveOption()
            }
            break
    }
}

function onDocumentPointerDown(event: PointerEvent) {
    if (event.target instanceof Node && !root.value?.contains(event.target)) {
        isOpen.value = false
    }
}

onMounted(() => document.addEventListener('pointerdown', onDocumentPointerDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointerDown))
</script>

<template>
    <div ref="root" class="relative min-w-0">
        <label :for="`${id}-input`" class="sr-only" v-text="label"></label>
        <div class="relative flex min-h-12 flex-wrap items-center gap-1 rounded-lg border-2 border-teal-600 py-1 ps-2 pe-12 transition-colors focus-within:bg-teal-800/50 focus-within:border-teal-500">
            <span
                v-for="option in selectedOptions"
                :key="String(option.value)"
                class="inline-flex max-w-full items-center rounded bg-teal-800 px-2 py-1 text-xs text-teal-100"
                aria-live="polite"
            >
                <span class="truncate" v-text="option.label"></span>
                <button
                    type="button"
                    class="ml-1 flex size-5 shrink-0 items-center justify-center rounded text-teal-200 hover:bg-teal-700 focus:outline-hidden focus:ring-2 focus:ring-teal-300"
                    :aria-label="`Remove ${option.label}`"
                    @mousedown.prevent
                    @click="removeOption(option.value)"
                >
                    <span class="icon icon-rounded text-sm" aria-hidden="true">close</span>
                </button>
            </span>
            <input
                :id="`${id}-input`"
                ref="input"
                v-model="searchQuery"
                type="text"
                role="combobox"
                autocomplete="off"
                :aria-label="label"
                :aria-expanded="isOpen"
                :aria-controls="listboxId"
                :aria-activedescendant="activeOptionId"
                aria-autocomplete="list"
                :placeholder="label"
                class="form-input min-w-32 flex-1 border-0 bg-transparent px-1 text-teal-200 placeholder:text-teal-500 focus:border-0 focus:ring-0"
                @focus="openList"
                @input="openList"
                @keydown="onKeydown"
            />
            <button
                v-if="selectedValues.length > 0"
                type="button"
                class="absolute right-1 top-1 flex h-10 w-8 shrink-0 items-center justify-center rounded text-teal-300 hover:bg-teal-700 hover:text-teal-100 focus:outline-hidden focus:ring-2 focus:ring-teal-300"
                :aria-label="`Clear ${label.toLocaleLowerCase()} selection`"
                title="Clear selection"
                @click="clearSelection"
            >
                <span class="icon icon-rounded" aria-hidden="true">delete</span>
            </button>
        </div>

        <div class="absolute z-20 mt-1 w-full">
            <ul
                :id="listboxId"
                role="listbox"
                :aria-label="label"
                :aria-multiselectable="multiple ? 'true' : undefined"
                class="max-h-56 overflow-y-auto scrollbar scrollbar-thumb-teal-700 scrollbar-track-transparent rounded border-2 border-teal-600 bg-teal-950 py-1 shadow-lg"
                :class="{ hidden: !isOpen || filteredOptions.length === 0 }"
            >
                <li
                    v-for="(option, index) in filteredOptions"
                    :id="`${id}-option-${index}`"
                    :key="String(option.value)"
                    role="option"
                    :aria-label="option.label"
                    :aria-selected="isSelected(option)"
                    class="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-teal-100 hover:bg-teal-800"
                    :class="{ 'bg-teal-800': activeIndex === index }"
                    @mouseenter="activeIndex = index"
                    @mousedown.prevent
                    @click="selectOption(option)"
                >
                    <span v-if="multiple" aria-hidden="true" class="shrink-0 icon icon-rounded icon-filled" v-text="isSelected(option) ? 'check_box' : 'check_box_outline_blank'"></span>
                    <slot name="option" :option="option" :item="option.item" :selected="isSelected(option)">
                        <span v-text="option.label"></span>
                    </slot>
                </li>
            </ul>
            <p
                v-if="isOpen && filteredOptions.length === 0"
                role="status"
                class="rounded border-2 border-teal-600 bg-teal-950 px-3 py-2 text-sm text-teal-300 shadow-lg"
            >
                No options found
            </p>
        </div>
    </div>
</template>
