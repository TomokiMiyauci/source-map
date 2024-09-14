import type { SourceMap } from "./source_map_format.ts";

/**
 * [Source Map](https://tc39.es/source-map/#index-map)
 */
export interface IndexMap {
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

  /** List of {@link Section} objects.
   *
   * [Source Map](https://tc39.es/source-map/#sections)
   */
  sections: Section[];
}

/**
 * [Source Map](https://tc39.es/source-map/#section)
 */
export interface Section {
  /**
   * Object with two fields, line and column, that represent the offset into generated code that the referenced source map represents.
   *
   * [Source Map](https://tc39.es/source-map/#offset)
   */
  offset: { line: number; column: number };

  /**
   * Embedded complete source map object.
   * An embedded map does not inherit any values from the containing index map.
   *
   * [Source Map](https://tc39.es/source-map/#map)
   */
  map: SourceMap;
}
