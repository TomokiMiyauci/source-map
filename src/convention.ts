import { isHTTPNewLine, isHttpsScheme } from "@miyauci/fetch";
import { parseJSONBytes, startsWith } from "@miyauci/infra";
import type { SourceMap } from "./source_map_format.ts";

// /**
//  * [Source Map](https://tc39.es/source-map/#extract-a-source-map-url-from-javascript-through-parsing)
//  */
// export function extractSourceMapURLFromJavaScriptThroughParsing(
//   source: string,
// ): null {
//   // 1. Let tokens be the list of tokens obtained by parsing source according to [ECMA-262].

//   // 2. For each token in tokens, in reverse order:

//   // 1. If token is not a single-line comment or a multi-line comment, return null.

//   // 2. Let comment be the content of token.

//   // 3. If matching a Source Map URL in comment returns a string, return it.

//   // 3. Return null.
//   return null;
// }

const JS_NEWLINE = /^/m;
const PATTERN = /^[@#]\s*sourceMappingURL=(\S*?)\s*$/;

/**
 * [Source Map](https://tc39.es/source-map/#extract-a-source-map-url-from-javascript-without-parsing)
 */
export function extractSourceMapURLFromJavaScriptWithoutParsing(
  source: string,
): string | null {
  // 1. Let lines be the result of strictly splitting source on ECMAScript line terminator code points.
  const lines = source.split(JS_NEWLINE);

  // 2. Let lastURL be null.
  let lastURL: string | null = null;

  const JS_COMMENT =
    /\s*(?:\/\/(?<single>.*)|\/\*(?<multi>.*?)\*\/|\/\*.*|$|(?<code>[^\/]+))/uym;

  // 3. For each line in lines:
  for (const line of lines) {
    // 1. Let position be a position variable for line, initially pointing at the start of line.
    JS_COMMENT.lastIndex = 0;

    // 2. While position doesn’t point past the end of line:
    while (JS_COMMENT.lastIndex < line.length) {
      const commentMatch = JS_COMMENT.exec(line)?.groups;
      const comment = commentMatch?.single ?? commentMatch?.multi;

      if (comment != null) {
        const match = PATTERN.exec(comment);

        if (match !== null) lastURL = match[1];
      } else if (commentMatch?.code != null) {
        lastURL = null;
      } else {
        // We found either trailing whitespaces or an unclosed comment.
        // Assert: JS_COMMENT.lastIndex === line.length
      }

      // 1. Collect a sequence of code points that are ECMAScript white space code points from line given position.

      // NOTE: The collected code points are not used, but position is still updated.

      // 2. If position points past the end of line, break.

      // 3. Let first be the code point of line at position.

      // 4. Increment position by 1.

      // 5. If first is U+002F (/) and position does not point past the end of line, then:

      // 1. Let second be the code point of line at position.

      // 2. Increment position by 1.

      // 3. If second is U+002F (/), then:

      // 1. Let comment be the code point substring from position to the end of line.

      // 2. If matching a Source Map URL in comment returns a string, set lastURL to it.

      // 3. Break.

      // 4. Else if second is U+002A (*), then:

      // 1. Let comment be the empty string.

      // 2. While position + 1 doesn’t point past the end of line:

      // 1. Let c1 be the code point of line at position.

      // 2. Increment position by 1.

      // 3. Let c2 be the code point of line at position.

      // 4. If c1 is U+002A (*) and c2 is U+002F (/), then:

      // 1. If matching a Source Map URL in comment returns a string, set lastURL to it.

      // 2. Increment position by 1.

      // 5. Append c1 to comment.

      // 5. Else, set lastURL to null.

      // 6. Else, set lastURL to null.

      // Note: We reset lastURL to null whenever we find a non-comment code character.
    }
  }

  // 4. Return lastURL.
  return lastURL;
}

/**
 * [Source Map](https://tc39.es/source-map/#match-a-source-map-url-in-a-comment)
 */
export function matchSourceMapURLInComment(comment: string): string | null {
  // 1. Let pattern be the regular expression /^[@#]\s*sourceMappingURL=(\S*?)\s*$/.
  const pattern = PATTERN;

  // 2. Let match be ! RegExpBuiltInExec(pattern, comment).
  const match = pattern.exec(comment);

  // 3. If match is not null, return match[1].
  if (match !== null) return match[1];

  // 4. Return null.
  return null;
}

/**
 * [Source Map](https://tc39.es/source-map/#extract-a-source-map-url-from-a-webassembly-source)
 */
export function extractSourceMapURLFromWebAssemblySource(
  bytes: Uint8Array,
): string | null {
  const module = new WebAssembly.Module(bytes);

  // 1. Let module be module_decode(bytes).

  // 2. If module is error, return null.

  // 3. For each custom section customSection of module,
  for (
    const customSection of WebAssembly.Module.customSections(
      module,
      "sourceMappingURL",
    )
  ) {
    // 1. Let name be the name of customSection, decoded as UTF-8.

    // 2. If name is "sourceMappingURL", then:

    // 1. Let value be the bytes of customSection, decoded as UTF-8.
    const value = new TextDecoder().decode(customSection);

    // 2. If value is failure, return null.

    // 3. Return value.
    return value;
  }

  // 4. Return null.
  return null;
}

export async function fetchSourceMap(url: URL): Promise<SourceMap> {
  // 1. Let promise be a new promise.
  const { promise, resolve } = Promise.withResolvers<SourceMap>();

  // 2. Let request be a new request whose URL is url.
  const request = new Request(url);

  // 3. Fetch request with processResponseConsumeBody set to the following steps given response response and null, failure, or a byte sequence bodyBytes:
  const response = await fetch(request);
  let bodyBytes = await response.bytes();

  // 1. If bodyBytes is null or failure, reject promise with a TypeError and abort these steps.

  const scheme = url.protocol.slice(0, -1);
  // 2. If url’s scheme is an HTTP(S) scheme and bodyBytes starts with `)]}'`, then:
  if (isHttpsScheme(scheme) && startsWith(bodyBytes, `)]}'`)) {
    // 1. While bodyBytes’s length is not 0 and bodyBytes’s 0th byte is not an HTTP newline byte:
    while (bodyBytes.length !== 0 && !isHTTPNewLine(bodyBytes[0])) {
      // 1. remove the 0th byte from bodyBytes.
      bodyBytes = bodyBytes.slice(1);

      // Note: For historic reasons, when delivering source maps over HTTP(S), servers may prepend a line starting with the string )]}' to the source map.
      // )]}'garbage here
      // {"version": 3, ...}
      // is interpreted as

      // {"version": 3, ...}
    }
  }

  // 3. Let sourceMap be the result of parsing JSON bytes to a JavaScript value given bodyBytes.
  const sourceMap = parseJSONBytes(bodyBytes) as unknown as SourceMap;

  // 4. If the previous step threw an error, reject promise with that error.

  // 5. Otherwise, resolve promise with sourceMap.
  resolve(sourceMap);

  // 4. Return promise.
  return promise;
}
