/**
 * [Source Map](https://tc39.es/source-map/#source-map-format)
 */
export interface SourceMap {
  /** Source Map version.
   *
   * [Source Map](https://tc39.es/source-map/#version)
   */
  version: number;

  /**
   * The generated code that this source map is associated with.
   * It’s not specified if this can be a URL, relative path name, or just a base name.
   * As such it has a mostly informal character.
   *
   * [Source Map](https://tc39.es/source-map/#file)
   */
  file?: string;

  /**
   * Useful for relocating source files on a server or removing repeated values in the {@link sources} entry.
   * This value is prepended to the individual entries in the "source" field.
   *
   * [Source Map](https://tc39.es/source-map/#sourceroot)
   */
  sourceRoot?: string;

  /**
   * List of original sources used by the {@link mappings} entry.
   * Each entry is either a string that is a (potentially relative) URL or `null` if the source name is not known.
   *
   * [Source Map](https://tc39.es/source-map/#sources)
   */
  sources: (string | null)[];

  /**
   * List of source content (that is the {@link https://tc39.es/source-map/#original-source Original Source}), useful when the "source" can’t be hosted.
   * The contents are listed in the same order as the {@link sources}. `null` may be used if some original sources should be retrieved by name.
   *
   * [Source Map](https://tc39.es/source-map/#sourcescontent)
   */
  sourcesContent?: (string | null)[];

  /**
   * List of symbol names which may be used by the {@link mappings} entry.
   *
   * [Source Map](https://tc39.es/source-map/#names)
   */
  names?: string[];

  /** String with the encoded mapping data.
   *
   * [Source Map](https://tc39.es/source-map/#mappings)
   */
  mappings: string;

  /**
   * List of indices of files that should be considered third party code, such as framework code or bundler-generated code.
   * This allows developer tools to avoid code that developers likely don’t want to see or step through, without requiring developers to configure this beforehand.
   * It refers to the sources array and lists the indices of all the known third-party {@link sources} in the source map.
   * Some browsers may also use the deprecated x_google_ignoreList field if {@link ignoreList} is not present.
   *
   * [Source Map](https://tc39.es/source-map/#ignorelist)
   */
  ignoreList?: number[];
}
