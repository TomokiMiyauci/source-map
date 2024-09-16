import { List, type Map } from "@miyauci/infra";

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

/**
 * [Source Map](https://tc39.es/source-map/#decoded-source-map)
 */
export class DecodedSourceMap {
  /**
   * [Source Map](https://tc39.es/source-map/#decoded-source-map-file)
   */
  file!: string | null;

  /**
   * [Source Map](https://tc39.es/source-map/#decoded-source-map-sources)
   */
  sources!: List<DecodedSource>;

  /**
   * [Source Map](https://tc39.es/source-map/#decoded-source-map-mappings)
   */
  mappings!: List<unknown>;
}

/**
 * [Source Map](https://tc39.es/source-map/#decoded-source)
 */
export interface DecodedSource {
  /**
   * [Source Map](https://tc39.es/source-map/#decoded-source-url)
   */
  url: URL | null;

  /**
   * [Source Map](https://tc39.es/source-map/#decoded-source-content)
   */
  content: string | null;

  /**
   * [Source Map](https://tc39.es/source-map/#decoded-source-ignored)
   */
  ignored: boolean;
}

/**
 * [Source Map](https://tc39.es/source-map/#optionally-get-a-string)
 */
export function optionallyGetString(
  key: string,
  jsonMap: Map<string, unknown>,
): string | null {
  // 1. If jsonMap[key] does not exist, return null.
  if (!jsonMap.exists(key)) return null;

  const value = jsonMap.get(key);
  // 2. If jsonMap[key] is not a string, optionally report an error and return null.
  if (typeof value !== "string") {
    optionallyReportError();
    return null;
  }

  // 3. Return jsonMap[key].
  return value;
}

/**
 * [Source Map](https://tc39.es/source-map/#optionally-get-a-list-of-strings)
 */
export function optionallyGetListString(
  key: string,
  jsonMap: Map<string, unknown>,
): List<string> {
  // 1. If jsonMap[key] does not exist, return a new empty list.
  if (!jsonMap.exists(key)) return new List();

  const items = jsonMap.get(key)!;
  // 2. If jsonMap[key] is not a list, optionally report an error and return a new empty list.
  if (!(items instanceof List)) {
    optionallyReportError();
    return new List();
  }

  // 3. Let list be a new empty list.
  const list = new List<string>();

  // 4. For each jsonItem of jsonMap[key]:
  for (const jsonItem of items) {
    // 1. If jsonItem is a string, append it to list.
    if (typeof jsonItem === "string") list.append(jsonItem);
    // 2. Else, optionally report an error and append "" to list.
    else list.append("");
  }

  // 5. Return list.
  return list;
}

/**
 * [Source Map](https://tc39.es/source-map/#optionally-get-a-list-of-optional-strings)
 */
export function optionallyGetListOfOptionallyStrings(
  key: string,
  jsonMap: Map<string, unknown>,
): List<string | null> {
  // 1. If jsonMap[key] does not exist, return a new empty list.
  if (!jsonMap.exists(key)) return new List();

  const items = jsonMap.get(key)!;
  // 2. If jsonMap[key] is not a list, optionally report an error and return a new empty list.
  if (!(items instanceof List)) {
    optionallyReportError();
    return new List();
  }

  // 3. Let list be a new empty list.
  const list = new List<string | null>();

  // 4. For each jsonItem of jsonMap[key]:
  for (const jsonItem of items) {
    // 1. If jsonItem is a string, append it to list.
    if (typeof jsonItem === "string") list.append(jsonItem);
    // 2. Else,
    else {
      // 1. If jsonItem is not null, optionally report an error.
      if (jsonItem !== null) optionallyReportError();

      // 2. Append null to list.
      list.append(null);
    }
  }

  // 5. Return list.
  return list;
}

/**
 * [Source Map](https://tc39.es/source-map/#optionally-get-a-list-of-array-indexes)
 */
export function optionallyGetListArrayIndex(
  key: string,
  jsonMap: Map<string, unknown>,
): List<number | null> {
  // If jsonMap[key] does not exist, return a new empty list.
  if (!jsonMap.exists(key)) return new List();

  const items = jsonMap.get(key)!;
  // If jsonMap[key] is not a list, optionally report an error and return a new empty list.
  if (!(items instanceof List)) {
    optionallyReportError();
    return new List();
  }

  // Let list be a new empty list.
  const list = new List<number | null>();

  // For each jsonItem of jsonMap[key]:
  for (const jsonItem of items) {
    // If jsonItem is a non-negative integer number, append it to list.
    if (0 <= jsonItem && Number.isInteger(jsonItem)) list.append(jsonItem);
    // Else,
    else {
      // If jsonItem is not null, optionally report an error.
      if (jsonItem !== null) optionallyReportError();

      // Append null to list.
      list.append(null);
    }
  }

  // Return list.
  return list;
}

/**
 * [Source Map](https://tc39.es/source-map/#optionally-report-an-error)
 */
export function optionallyReportError() {}

/**
 * [Source Map](https://tc39.es/source-map/#decoded-mapping)
 */
export interface DecodedMapping {
  /**
   * A non-negative integer.
   *
   * [Source Map](https://tc39.es/source-map/#decoded-mapping-generatedline)
   */
  generatedLine: number;

  /**
   * A non-negative integer.
   *
   * [Source Map](https://tc39.es/source-map/#decoded-mapping-generatedcolumn)
   */
  generatedColumn: number;

  /**
   * A decoded source or null.
   *
   * [Source Map](https://tc39.es/source-map/#decoded-mapping-originalsource)
   */
  originalSource: DecodedSource | null;

  /**
   * A non-negative integer or null.
   *
   * [Source Map](https://tc39.es/source-map/#decoded-mapping-originalline)
   */
  originalLine: number | null;

  /**
   * A non-negative integer or null.
   *
   * [Source Map](https://tc39.es/source-map/#decoded-mapping-originalcolumn)
   */
  originalColumn: number | null;

  /**
   * A string or null.
   *
   * [Source Map](https://tc39.es/source-map/#decoded-mapping-name)
   */
  name: string | null;
}
