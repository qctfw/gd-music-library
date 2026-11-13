import type { ExternalLinkType } from "./external-link";
import type { MusicPlatform } from "./music-platform";

export type Artist = {
	id: number;
	name: string;
	website: URL | null;
  youtubeUrl: URL | null;
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
	url: string|null;
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
  url: URL;
}
