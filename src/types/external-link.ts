import BandcampLogo from '../assets/images/bandcamp.webp'
import DiscordLogo from '../assets/images/discord.svg'
import FacebookLogo from '../assets/images/facebook.svg'
import InstagramLogo from '../assets/images/instagram.webp'
import ItchIoLogo from '../assets/images/itchio.svg'
import NCSLogo from '../assets/images/ncs.png'
import NewgroundsLogo from '../assets/images/newgrounds.webp'
import SoundcloudLogo from '../assets/images/soundcloud.webp'
import SpotifyLogo from '../assets/images/spotify.webp'
import TikTokLogo from '../assets/images/tiktok.svg'
import TwitchLogo from '../assets/images/twitch.svg'
import TwitterLogo from '../assets/images/twitter.svg'
import YouTubeLogo from '../assets/images/youtube.webp'

export const ExternalLinkType = {
  YouTube: 1,
  Newgrounds: 2,
  Soundcloud: 3,
  Spotify: 4,
  Bandcamp: 5,
  NCS: 6,
  Website: 7,
  Instagram: 8,
  Twitter: 9,
  Facebook: 10,
  Twitch: 11,
  Discord: 12,
  TikTok: 13,
  ItchIo: 14,
} as const

export type ExternalLinkType = (typeof ExternalLinkType)[keyof typeof ExternalLinkType]

export type ExternalLinkTypeItem = {
  name: string,
  logoUrl: ImageMetadata | null,
}

export const ExternalLinkTypeMeta: Record<ExternalLinkType, ExternalLinkTypeItem> = {
  1: {
    name: 'YouTube',
    logoUrl: YouTubeLogo,
  },
  2: {
    name: 'Newgrounds',
    logoUrl: NewgroundsLogo,
  },
  3: {
    name: 'Soundcloud',
    logoUrl: SoundcloudLogo,
  },
  4: {
    name: 'Spotify',
    logoUrl: SpotifyLogo,
  },
  5: {
    name: 'Bandcamp',
    logoUrl: BandcampLogo,
  },
  6: {
    name: 'NCS',
    logoUrl: NCSLogo,
  },
  7: {
    name: 'Website',
    logoUrl: null,
  },
  8: {
    name: 'Instagram',
    logoUrl: InstagramLogo,
  },
  9: {
    name: 'Twitter',
    logoUrl: TwitterLogo,
  },
  10: {
    name: 'Facebook',
    logoUrl: FacebookLogo,
  },
  11: {
    name: 'Twitch',
    logoUrl: TwitchLogo,
  },
  12: {
    name: 'Discord',
    logoUrl: DiscordLogo,
  },
  13: {
    name: 'TikTok',
    logoUrl: TikTokLogo,
  },
  14: {
    name: 'Itch.io',
    logoUrl: ItchIoLogo,
  },
}

export function isExternalLinkType(value: unknown): value is ExternalLinkType {
    return Object.values(ExternalLinkType).includes(Number(value) as ExternalLinkType)
}
