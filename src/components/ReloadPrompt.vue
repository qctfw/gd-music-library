<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'

const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegistered(r) {
    r && setInterval(() => {
      r.update()
    }, 60 * 60 * 1000)
  },
  onNeedRefresh() {
    console.log('Need refresh to update!')
  },
  onOfflineReady() {
    console.log('Offline Ready!')
  },
})

async function close() {
  needRefresh.value = false
}
</script>

<template>
    <aside v-if="needRefresh" class="fixed w-full bottom-0 py-2 flex flex-row items-center justify-center gap-2 text-sm lg:text-base bg-slate-800 text-teal-100">
        <span>Update available</span>
        <button class="border-2 border-teal-700 hover:bg-teal-700 text-teal-100 px-2 py-1 rounded" @click="updateServiceWorker()">Update</button>
        <button class="border-2 border-slate-700 hover:bg-slate-700 text-slate-100 px-2 py-1 rounded" @click="close">Close</button>
    </aside>
</template>