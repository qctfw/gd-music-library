export type ChangelogChange = {
  artistId: number;
  tags: number[];
  count: number;
}

export type ChangelogMetadata = {
  version: number;
  timestamp: number;
  highestSongId: number;
  changes: ChangelogChange[];
}
