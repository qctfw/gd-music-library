import NoteLogo from '../assets/images/note.png'
import NCSLogo from '../assets/images/ncs.png'
import ChompoLogo from '../assets/images/chompo.png'

import type { MusicPlatform, MusicPlatformItem } from './music-platform'

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
