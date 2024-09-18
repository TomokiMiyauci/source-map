export function prefix(potentialPrefix: string, input: Uint8Array): boolean {
  // 1. Let i be 0.
  let i = 0;

  // 2. While true:
  while (true) {
    // 1. If i is greater than or equal to potentialPrefix’s length, then return true.
    if (potentialPrefix.length <= i) return true;

    // 2. If i is greater than or equal to input’s length, then return false.
    if (input.length <= i) return false;

    // 3. Let potentialPrefixByte be the ith byte of potentialPrefix.
    const potentialPrefixByte = potentialPrefix.charCodeAt(i);

    // 4. Let inputByte be the ith byte of input.
    const inputByte = input[i];

    // 5. Return false if potentialPrefixByte is not inputByte.
    if (potentialPrefixByte !== inputByte) return false;

    // 6. Set i to i + 1.
    i++;
  }
}

/**
 * [Infra Standard](https://infra.spec.whatwg.org/#byte-sequence-starts-with)
 */
export function startsWith(
  input: Uint8Array,
  potentialPrefix: string,
): boolean {
  return prefix(potentialPrefix, input);
}
