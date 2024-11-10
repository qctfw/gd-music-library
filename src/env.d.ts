/// <reference path="../.astro/types.d.ts" />
type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
	interface Locals extends Runtime {}
}

interface Artist {
	id: number;
	name: string;
	website: URL|null;
	youtubeUrl: URL|null;
}

interface Song {
	id: number;
	name: string;
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

interface Tag {
	id: number;
	name: string;
}

enum MusicPlatform {
	None = 0,
	NCS = 1,
}