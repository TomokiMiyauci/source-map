import { List, Map, range } from "@miyauci/infra";

/**
 * [Infra Standard](https://infra.spec.whatwg.org/#parse-a-json-string-to-an-infra-value)
 */
export function parseJSONStringIntoInfraValue(string: string): InfraValue {
  // 1. Let jsValue be ? Call(%JSON.parse%, undefined, « string »).
  const jsValue = JSON.parse.call(null, string);

  // 2. Return the result of converting a JSON-derived JavaScript value to an Infra value, given jsValue.
  return convertJSONDerivedJavaScriptValue(jsValue);
}

export type InfraValue =
  | string
  | boolean
  | number
  | null
  | List<InfraValue>
  | Map<string | symbol, InfraValue>;

/**
 * [Infra Standard](https://infra.spec.whatwg.org/#convert-a-json-derived-javascript-value-to-an-infra-value)
 */
export function convertJSONDerivedJavaScriptValue(
  jsValue: unknown,
): InfraValue {
  // 1. If Type(jsValue) is Null, Boolean, String, or Number, then return jsValue.
  if (
    jsValue === null ||
    typeof jsValue === "boolean" ||
    typeof jsValue === "string" ||
    typeof jsValue === "number"
  ) return jsValue;

  // 2. If IsArray(jsValue) is true, then:
  if (Array.isArray(jsValue)) {
    // 1. Let result be an empty list.
    const result = new List<InfraValue>();

    // 2. Let length be ! ToLength(! Get(jsValue, "length")).
    const length = jsValue.length;

    // 3. For each index of the range 0 to length − 1, inclusive:
    for (const index of range(0, length - 1, "exclusive")) {
      // 1. Let indexName be ! ToString(index).
      const indexName = String(index);

      // 2. Let jsValueAtIndex be ! Get(jsValue, indexName).
      const jsValueAtIndex = Reflect.get(jsValue, indexName);

      // 3. Let infraValueAtIndex be the result of converting a JSON-derived JavaScript value to an Infra value, given jsValueAtIndex.
      const infraValueAtIndex = convertJSONDerivedJavaScriptValue(
        jsValueAtIndex,
      );

      // 4. Append infraValueAtIndex to result.
      result.append(infraValueAtIndex);
    }

    // 4. Return result.
    return result;
  }

  // 3. Let result be an empty ordered map.
  const result = new Map<string | symbol, InfraValue>();

  if (jsValue) {
    // 4. For each key of ! jsValue.[[OwnPropertyKeys]]():
    for (const key of Reflect.ownKeys(jsValue)) {
      // 1. Let jsValueAtKey be ! Get(jsValue, key).
      const jsValueAtKey = Reflect.get(jsValue, key);

      // 2. Let infraValueAtKey be the result of converting a JSON-derived JavaScript value to an Infra value, given jsValueAtKey.
      const infraValueAtKey = convertJSONDerivedJavaScriptValue(jsValueAtKey);

      // 3. Set result[key] to infraValueAtKey.
      result.set(key, infraValueAtKey);
    }
  }

  // 5. Return result.
  return result;
}

/**
 * [Infra Standard](https://infra.spec.whatwg.org/#parse-a-json-string-to-a-javascript-value)
 */
export function parseJSONString(string: string): JsonValue {
  // 1. Return ? Call(%JSON.parse%, undefined, « string »).
  return JSON.parse(string);
}

/**
 * [Infra Standard](https://infra.spec.whatwg.org/#parse-json-bytes-to-a-javascript-value)
 */
export function parseJSONBytes(bytes: Uint8Array): JsonValue {
  // 1. Let string be the result of running UTF-8 decode on bytes. [ENCODING]
  const string = new TextDecoder().decode(bytes);

  // 2. Return the result of parsing a JSON string to a JavaScript value given string.
  return parseJSONString(string);
}

export type JsonValue = string | number | boolean | null | JsonValue[] | {
  [k: string]: JsonValue;
};
