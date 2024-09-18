import {
  concatenate,
  isAsciiString,
  List,
  Map,
  parseJSONIntoInfraValue,
  type PositionVariable,
  strictlySplit,
} from "@miyauci/infra";
import { BASE64_ALPHABET } from "@miyauci/rfc4648";

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
 * [Source Map](https://tc39.es/source-map/#decode-a-source-map-from-a-json-string)
 */
export function decodeSourceMapFromJSONString(
  str: string,
  baseURL: URL,
): DecodedSourceMap {
  // 1. Let jsonMap be the result of parsing a JSON string to an Infra value str.
  const jsonMap = parseJSONIntoInfraValue(str);

  // 2. If jsonMap is not a map, report an error and abort these steps.
  if (!(jsonMap instanceof Map)) throw new Error();

  // 3. Decode a source map given jsonMap and baseURL, and return its result if any.
  return decodeSourceMap(jsonMap, baseURL);
}

/**
 * [Source Map](https://tc39.es/source-map/#decode-a-source-map)
 */
export function decodeSourceMap(
  jsonMap: Map<unknown, unknown>,
  baseURL: URL,
): DecodedSourceMap {
  // 1. If jsonMap["version"] does not exist or jsonMap["version"] is not 3, optionally report an error.
  if (!jsonMap.exists("version") || jsonMap.get("version") !== 3) {
    optionallyReportError();
  }

  // 2. If jsonMap["mappings"] does not exist or jsonMap["mappings"], is not a string, throw an error.
  if (
    !jsonMap.exists("mappings") || typeof jsonMap.get("mappings") !== "string"
  ) throw new Error();

  // 3. If jsonMap["sources"] does not exist or jsonMap["sources"], is not a list, throw an error.
  if (!jsonMap.exists("sources") || !(jsonMap.get("sources") instanceof List)) {
    throw new Error();
  }

  // 4. Let sourceMap be a new decoded source map.
  const sourceMap = new DecodedSourceMap();

  // 5. Set sourceMap’s file to optionally get a string "file" from jsonMap.
  sourceMap.file = optionallyGetString("file", jsonMap);

  // 6. Set sourceMap’s sources to the result of decoding source map sources given baseURL with:
  sourceMap.sources = decodeSourceMapSources(
    baseURL,
    // sourceRoot set to optionally get a string "sourceRoot" from jsonMap;
    optionallyGetString("sourceRoot", jsonMap),
    // sources set to optionally get a list of optional strings "sources" from jsonMap;
    optionallyGetListString("sources", jsonMap),
    // sourcesContent set to optionally get a list of optional strings "sourcesContent" from jsonMap;
    optionallyGetListOfOptionallyStrings("sourcesContent", jsonMap),
    // ignoredSources set to optionally get a list of array indexes "ignoreList" from jsonMap.
    optionallyGetListArrayIndex("ignoreList", jsonMap),
  );

  // 7. Set sourceMap’s mappings to the result of decoding source map mappings with:
  sourceMap.mappings = decodeSourceMapMappings(
    // mappings set to jsonMap["mappings"];
    jsonMap.get("mappings") as string,
    // names set to optionally get a list of strings "names" from jsonMap;
    optionallyGetListString("names", jsonMap),
    // sources set to sourceMap’s sources.
    sourceMap.sources,
  );

  // 8. Return sourceMap.
  return sourceMap;
}

/**
 * [Source Map](https://tc39.es/source-map/#optionally-get-a-string)
 */
export function optionallyGetString(
  key: string,
  jsonMap: Map<unknown, unknown>,
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
  jsonMap: Map<unknown, unknown>,
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
  jsonMap: Map<unknown, unknown>,
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
  jsonMap: Map<unknown, unknown>,
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

/**
 * [Source Map](https://tc39.es/source-map/#decode-source-map-mappings)
 */
export function decodeSourceMapMappings(
  mappings: string,
  names: List<string>,
  sources: List<DecodedSource>,
): List<DecodedMapping> {
  // 1. If mappings is not an ASCII string, throw an error.
  if (!isAsciiString(mappings)) throw new Error();

  const allowedChars = /^[,;0-9A-Za-z+/]*$/;
  // 2. If mappings contains any code unit other than:
  if (!allowedChars.test(mappings)) {
    // - U+002C (,) or U+003B (;);
    // - U+0030 (0) to U+0039 (9);
    // - U+0041 (A) to U+005A (Z);
    // - U+0061 (a) to U+007A (z);
    // - U+002B (+), U+002F (/)
    // NOTE: These are the valid [base64] characters (excluding the padding character =), together with , and ;.
    // then throw an error.
    throw new Error();
  }

  // 3. Let decodedMappings be a new empty list.
  const decodedMappings = new List<DecodedMapping>();

  // 4. Let groups be the result of strictly splitting mappings on ;.
  const groups = strictlySplit(mappings, ";");

  // 5. Let generatedLine be 0.
  let generatedLine = 0;

  // 6. Let originalLine be 0.
  let originalLine = 0;

  // 7. Let originalColumn be 0.
  let originalColumn = 0;

  // 8. Let sourceIndex be 0.
  let sourceIndex = 0;

  // 9. Let nameIndex be 0.
  let nameIndex = 0;

  // 10. While generatedLine is less than groups’s size:
  while (groups.size < generatedLine) {
    // 1. If groups[generatedLine] is not the empty string, then:
    if (groups[generatedLine] !== "") {
      // 1. Let segments be the result of strictly splitting groups[generatedLine] on ,.
      const segments = strictlySplit(groups[generatedLine], ",");

      // 2. Let generatedColumn be 0.
      let generatedColumn = 0;

      // 3. For each segment in segments:
      for (const segment of segments) {
        // 1. Let position be a position variable for segment, initially pointing at segment’s start.
        const position = { value: 0 } satisfies PositionVariable;

        // 2. Decode a base64 VLQ from segment given position and let relativeGeneratedColumn be the result.
        const relativeGeneratedColumn = decodeBase64VLQ(segment, position);

        // 3. If relativeGeneratedColumn is null, optionally report an error and continue with the next iteration.
        if (relativeGeneratedColumn === null) {
          optionallyReportError();
          continue;
        }

        // 4. Increase generatedColumn by relativeGeneratedColumn. If the result is negative, optionally report an error and continue with the next iteration.
        if ((generatedColumn -= relativeGeneratedColumn) < 0) {
          optionallyReportError();
          continue;
        }

        // 5. Let decodedMapping be a new decoded mapping whose generatedLine is generatedLine, generatedColumn is generatedColumn, originalSource is null, originalLine is null, originalColumn is null, and name is null.
        const decodedMapping: DecodedMapping = {
          generatedLine,
          generatedColumn,
          originalSource: null,
          originalLine: null,
          originalColumn: null,
          name: null,
        } satisfies DecodedMapping;

        // 6. Append decodedMapping to decodedMappings.
        decodedMappings.append(decodedMapping);

        // 7. Decode a base64 VLQ from segment given position and let relativeSourceIndex be the result.
        const relativeSourceIndex = decodeBase64VLQ(segment, position);

        // 8. Decode a base64 VLQ from segment given position and let relativeOriginalLine be the result.
        const relativeOriginalLine = decodeBase64VLQ(segment, position);

        // 9. Decode a base64 VLQ from segment given position and let relativeOriginalColumn be the result.
        const relativeOriginalColumn = decodeBase64VLQ(segment, position);

        // 10. If relativeOriginalColumn is null, then:
        if (relativeOriginalColumn === null) {
          // 1. If relativeSourceIndex is not null, optionally report an error.
          if (relativeSourceIndex !== null) optionallyReportError();

          // 2. Continue with the next iteration.
          continue;
        }

        // 11. Increase sourceIndex by relativeSourceIndex.
        sourceIndex += relativeSourceIndex!;

        // 12. Increase originalLine by relativeOriginalLine.
        originalLine += relativeOriginalLine!;

        // 13. Increase originalColumn by relativeOriginalColumn.
        originalColumn += relativeOriginalColumn;

        // 14. If any of sourceIndex, originalLine, or originalColumn are less than 0, or if sourceIndex is greater than or equal to sources’s size, optionally report an error.
        if (
          (sourceIndex < 0 || originalLine < 0 || originalColumn < 0) ||
          (sources.size <= sourceIndex)
        ) optionallyReportError();
        // 15. Else,
        else {
          // 1. Set decodedMapping’s originalSource to sources[sourceIndex].
          decodedMapping.originalSource = sources[sourceIndex];

          // 2. Set decodedMapping’s originalLine to originalLine.
          decodedMapping.originalLine = originalLine;

          // 3. Set decodedMapping’s originalColumn to originalColumn.
          decodedMapping.originalColumn = originalColumn;
        }

        // 16. Decode a base64 VLQ from segment given position and let relativeNameIndex be the result.
        const relativeNameIndex = decodeBase64VLQ(segment, position);

        // 17. If relativeNameIndex is not null, then:
        if (relativeNameIndex !== null) {
          // 1. Increase nameIndex by relativeNameIndex.
          nameIndex += relativeNameIndex;

          // 2. If nameIndex is negative or greater than names’s size, optionally report an error.
          if (nameIndex < 0 || names.size < nameIndex) optionallyReportError();
          else {
            // 3. Else, set decodedMapping’s name to names[nameIndex].
            decodedMapping.name = names[nameIndex];
          }
        }

        // 18. If position does not point to the end of segment, optionally report an error.
        if (!(position.value >= segment.length)) optionallyReportError();
      }
    }

    // 2. Increase generatedLine by 1.
    generatedLine++;
  }

  // 11. Return decodedMappings.
  return decodedMappings;
}

/**
 * [](https://tc39.es/source-map/#decode-a-base64-vlq)
 */
export function decodeBase64VLQ(
  segment: string,
  position: PositionVariable,
): number | null {
  // 1. If position points to the end of segment, return null.
  if (position.value >= segment.length) return null;

  // 2. Let first be a byte whose the value is the number corresponding to segment’s positionth code unit, according to the [base64] encoding.
  const first = BASE64_ALPHABET[segment[position.value]];

  // NOTE: The two most significant bits of first are 0.

  // 3. Let sign be 1 if first & 0x01 is 0x00, and -1 otherwise.
  const sign = (first & 0x01) === 0x00 ? 1 : -1;

  // 4. Let value be (first >> 1) & 0x0F, as a number.
  let value = (first >> 1) & 0x0F;

  // 5. Let nextShift be 16.
  let nextShift = 16;

  // 6. Let currentByte be first.
  let currentByte = first;

  // 7. While currentByte & 0x20 is 0x20:
  while ((currentByte & 0x20) === 0x20) {
    // 1. Advance position by 1.
    position.value++;

    // 2. If position points to the end of segment, throw an error.
    if (position.value >= segment.length) throw new Error();

    // 3. Set currentByte to the byte whose the value is the number corresponding to segment’s positionth code unit, according to the [base64] encoding.
    currentByte = BASE64_ALPHABET[segment[position.value]];

    // 4. Let chunk be currentByte & 0x1F, as a number.
    const chunk = currentByte & 0x1F;

    // 5. Add chunk * nextShift to value.
    value += chunk * nextShift;

    // 6. If value is greater than or equal to 231, throw an error.
    if (231 <= value) throw new Error();

    // 7. Multiply nextShift by 32.
    nextShift *= 32;
  }

  // 8. Advance position by 1.
  position.value++;

  // 9. If value is 0 and sign is -1, return -2147483648.
  if (value === 0 && sign === -1) return -2147483648;
  // NOTE: -2147483648 is the smallest 32-bit signed integer.

  // 10. Return value * sign.
  return value * sign;
}

/**
 * [](https://tc39.es/source-map/#decode-source-map-sources)
 */
export function decodeSourceMapSources(
  baseURL: URL,
  sourceRoot: string | null,
  sources: List<string | null>,
  sourcesContent: List<string | null>,
  ignoredSources: List<number | null>,
): List<DecodedSource> {
  // 1. Let decodedSources be a new empty list.
  const decodedSources = new List<DecodedSource>();

  // 2. Let sourceURLPrefix be "".
  let sourceURLPrefix = "";

  // 3. If sourceRoot is not null, then:
  if (sourceRoot !== null) {
    // 1. If sourceRoot contains the code point U+002F (/), then:
    if (sourceRoot?.includes("/")) {
      // 1. Let index be the index of the last occurrence of U+002F (/) in sourceRoot.
      const index = sourceRoot.lastIndexOf("/");

      // 2. Set sourceURLPrefix to the substring of sourceRoot from 0 to index + 1.
      sourceURLPrefix = sourceRoot.substring(0, index + 1);
    } else {
      // 2. Else, set sourceURLPrefix to the concatenation of sourceRoot and "/".
      sourceURLPrefix = concatenate(sourceRoot, "/");
    }
  }

  // 4. For each source of sources with index index:
  for (const index of sources.indices()) {
    let source = sources[index];

    // 1. Let decodedSource be a new decoded source whose URL is null, content is null, and ignored is false.
    const decodedSource: DecodedSource = {
      url: null,
      content: null,
      ignored: false,
    };

    // 2. If source is not null:
    if (source !== null) {
      // 1. Set source to the concatenation of sourceURLPrefix and source.
      source = concatenate(sourceURLPrefix, source);

      // 2. Let sourceURL be the result of URL parsing source with baseURL.
      const sourceURL = URL.parse(source, baseURL);

      // 3. If sourceURL is failure, optionally report an error.
      if (!sourceURL) optionallyReportError();
      // 4. Else, set decodedSource’s URL to sourceURL.
      else decodedSource.url = sourceURL;
    }

    // 3. If index is in ignoredSources, set decodedSource’s ignored to true.
    if (index in ignoredSources) decodedSource.ignored = true;

    // 4. If sourcesContent’s size is greater than or equal to index, set decodedSource’s content to sourcesContent[index].
    if (index <= sourcesContent.size) {
      decodedSource.content = sourcesContent[index];
    }

    // 5. Append decodedSource to decodedSources.
    decodedSources.append(decodedSource);
  }

  // 5. Return decodedSources.
  return decodedSources;
}
