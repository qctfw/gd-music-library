import type { ImageMetadata } from "astro"

import NoteLogo from '../assets/images/note.png'
import NCSLogo from '../assets/images/ncs.png'
import ChompoLogo from '../assets/images/chompo.png'

export const MusicPlatform = {
    None: 0,
    NCS: 1,
    Chompo: 2,
} as const

export type MusicPlatform = (typeof MusicPlatform)[keyof typeof MusicPlatform]

export type MusicPlatformItem = {
    name: String,
    site: URL,
    image: ImageMetadata,
    imageSize: String,
}

export const MusicPlatformMeta: Record<MusicPlatform, MusicPlatformItem> = {
    0: {
        name: 'Default',
        site: new URL('https://geometrydash.com'),
        image: NoteLogo,
        imageSize: 'size-6',
    },
    1: {
        name: 'NoCopyrightSounds',
        site: new URL('https://ncs.io'),
        image: NCSLogo,
        imageSize: 'w-8',
    },
    2: {
        name: 'CHOMPO',
        site: new URL('https://chompochompo.com'),
        image: ChompoLogo,
        imageSize: 'w-12',
    },
}

export function isMusicPlatform(value: unknown): value is MusicPlatform {
    return Object.values(MusicPlatform).includes(Number(value) as MusicPlatform)
}