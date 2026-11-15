import type { ExternalLinkType } from "./external-link";
import type { MusicPlatform } from "./music-platform";

export type Artist = {
	id: number;
  name: string;
	/** @deprecated Use `links` instead */
  website: string | null;
	/** @deprecated Use `links` instead */
  youtubeUrl: string | null;
  links: ExternalLink[];
}

export type Song = {
	id: number;
	name: string;
	searchName: string;
	artistId: number;
	filesize: number;
	duration: number;
	tagIds: number[];
	musicPlatform: MusicPlatform;
  extraArtistIds: number[];
	/** @deprecated Use `links` instead */
  url: string | null;
  isNew: boolean;
	priorityOrder: number;
  songNumber: number;
	links: ExternalLink[],
}

export type Tag = {
	id: number;
	name: string;
}

export type ExternalLink = {
  title: string;
  typeId: ExternalLinkType;
  url: string;
}
