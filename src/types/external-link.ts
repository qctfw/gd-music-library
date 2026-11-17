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

const externalLinkTypeValues: ReadonlySet<number> = new Set(Object.values(ExternalLinkType))

export type ExternalLinkType = (typeof ExternalLinkType)[keyof typeof ExternalLinkType]

export type ExternalLinkTypeItem = {
  name: string,
  logoUrl: ImageMetadata | null,
}

export const ExternalLinkTypeName: Record<ExternalLinkType, string> = {
  1: 'YouTube',
  2: 'Newgrounds',
  3: 'Soundcloud',
  4: 'Spotify',
  5: 'Bandcamp',
  6: 'NCS',
  7: 'Website',
  8: 'Instagram',
  9: 'Twitter',
  10: 'Facebook',
  11: 'Twitch',
  12: 'Discord',
  13: 'TikTok',
  14: 'Itch.io',
}

export function isExternalLinkType(value: unknown): value is ExternalLinkType {
    return externalLinkTypeValues.has(Number(value))
}
