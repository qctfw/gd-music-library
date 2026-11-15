import { decodeMusicLibrary, parseMusicLibrary } from '../stores/music-library-parser'
import type { MusicLibraryWorkerRequest, MusicLibraryWorkerResponse } from '../stores/music-library-parser'

// Cast through `unknown` so the worker compiles without the `webworker` lib.
const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<MusicLibraryWorkerRequest>) => void) | null
  postMessage: (message: MusicLibraryWorkerResponse) => void
}

ctx.onmessage = async (event) => {
  try {
    const response = await fetch(event.data.url)

    if (!response.ok) {
      throw new Error(`Failed to fetch music library: ${response.status} ${response.statusText}`)
    }

    const encoded = await response.text()
    const data = parseMusicLibrary(decodeMusicLibrary(encoded))

    ctx.postMessage({ ok: true, data })
  } catch (error) {
    ctx.postMessage({ ok: false, error: error instanceof Error ? error.message : String(error) })
  }
}
