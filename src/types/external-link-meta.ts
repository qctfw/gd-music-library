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

import { ExternalLinkTypeName } from './external-link'
import type { ExternalLinkType, ExternalLinkTypeItem } from './external-link'

export const ExternalLinkTypeMeta: Record<ExternalLinkType, ExternalLinkTypeItem> = {
  1: {
    name: ExternalLinkTypeName[1],
    logoUrl: YouTubeLogo,
  },
  2: {
    name: ExternalLinkTypeName[2],
    logoUrl: NewgroundsLogo,
  },
  3: {
    name: ExternalLinkTypeName[3],
    logoUrl: SoundcloudLogo,
  },
  4: {
    name: ExternalLinkTypeName[4],
    logoUrl: SpotifyLogo,
  },
  5: {
    name: ExternalLinkTypeName[5],
    logoUrl: BandcampLogo,
  },
  6: {
    name: ExternalLinkTypeName[6],
    logoUrl: NCSLogo,
  },
  7: {
    name: ExternalLinkTypeName[7],
    logoUrl: null,
  },
  8: {
    name: ExternalLinkTypeName[8],
    logoUrl: InstagramLogo,
  },
  9: {
    name: ExternalLinkTypeName[9],
    logoUrl: TwitterLogo,
  },
  10: {
    name: ExternalLinkTypeName[10],
    logoUrl: FacebookLogo,
  },
  11: {
    name: ExternalLinkTypeName[11],
    logoUrl: TwitchLogo,
  },
  12: {
    name: ExternalLinkTypeName[12],
    logoUrl: DiscordLogo,
  },
  13: {
    name: ExternalLinkTypeName[13],
    logoUrl: TikTokLogo,
  },
  14: {
    name: ExternalLinkTypeName[14],
    logoUrl: ItchIoLogo,
  },
}
