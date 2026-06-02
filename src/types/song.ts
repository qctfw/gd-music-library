import type { MusicPlatform } from "./music-platform";

export type Artist = {
	id: number;
	name: string;
	website: URL|null;
	youtubeUrl: URL|null;
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
}

export type Tag = {
	id: number;
	name: string;
}