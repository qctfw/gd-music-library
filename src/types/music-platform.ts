import type { ImageMetadata } from "astro"

export const MusicPlatform = {
    None: 0,
    NCS: 1,
    Chompo: 2,
} as const

const musicPlatformValues: ReadonlySet<number> = new Set(Object.values(MusicPlatform))

export type MusicPlatform = (typeof MusicPlatform)[keyof typeof MusicPlatform]

export type MusicPlatformItem = {
    name: String,
    site: URL,
    image: ImageMetadata,
    imageSize: String,
}

export function isMusicPlatform(value: unknown): value is MusicPlatform {
    return musicPlatformValues.has(Number(value))
}
