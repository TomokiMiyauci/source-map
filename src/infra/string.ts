import { List } from "@miyauci/infra";

/**
 * [Infra Standard](https://infra.spec.whatwg.org/#strictly-split)
 */
export function strictlySplit(input: string, delimiter: string): List<string> {
  // 1. Let position be a position variable for input, initially pointing at the start of input.
  const position = { value: 0 } satisfies PositionVariable;

  // 2. Let tokens be a list of strings, initially empty.
  const tokens = new List<string>();

  function isNotEqualToDelimiter(codePoint: string): boolean {
    return codePoint !== delimiter;
  }

  // 3. Let token be the result of collecting a sequence of code points that are not equal to delimiter from input, given position.
  const token = collectSequenceCodePoint(
    isNotEqualToDelimiter,
    input,
    position,
  );

  // 4. Append token to tokens.
  tokens.append(token);

  const endOfInput = input.length;
  // 5. While position is not past the end of input:
  while (position.value <= endOfInput) {
    // 1. Assert: the code point at position within input is delimiter.

    // 2. Advance position by 1.
    position.value++;

    // 3. Let token be the result of collecting a sequence of code points that are not equal to delimiter from input, given position.
    const token = collectSequenceCodePoint(
      isNotEqualToDelimiter,
      input,
      position,
    );

    // 4. Append token to tokens.
    tokens.append(token);
  }

  // 6. Return tokens.
  return tokens;
}

/**
 * [Infra Standard](https://infra.spec.whatwg.org/#collect-a-sequence-of-code-points)
 */
function collectSequenceCodePoint(
  condition: (codePoint: string) => boolean,
  input: string,
  position: PositionVariable,
): string {
  // 1. Let result be the empty string.
  let result = "";

  const endOfInput = input.length;
  // 2. While position doesn’t point past the end of input and the code point at position within input meets the condition condition:
  while (position.value < endOfInput && condition(input[position.value])) {
    // 1. Append that code point to the end of result.
    result += input[position.value];

    // 2. Advance position by 1.
    position.value++;
  }

  // 3. Return result.
  return result;
}

/**
 * [Infra Standard](https://infra.spec.whatwg.org/#string-concatenate)
 */
export function concatenate(
  list: Iterable<string>,
  separator?: string,
): string {
  const array = [...list];

  // 1. If list is empty, then return the empty string.
  if (!array) return "";

  // 2. If separator is not given, then set separator to the empty string.
  separator ??= "";

  // 3. Return a string whose contents are list’s items, in order, separated from each other by separator.
  return array.join(separator);
}

/**
 * [Infra Standard](https://infra.spec.whatwg.org/#string-position-variable)
 */
export interface PositionVariable {
  value: number;
}

/**
 * [Infra Standard](https://infra.spec.whatwg.org/#ascii-string)
 */
export function isAsciiString(input: string): boolean {
  for (let i = 0; i < input.length; i++) {
    if (0x7F < input.charCodeAt(i)) return false;
  }

  return true;
}
