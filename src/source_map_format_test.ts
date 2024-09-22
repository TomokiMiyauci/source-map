import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { List, Map } from "@miyauci/infra";
import {
  decodeBase64VLQ,
  optionallyGetArrayIndexList,
  optionallyGetOptionallyStringList,
  optionallyGetString,
  optionallyGetStringList,
} from "./source_map_format.ts";

describe("decodeBase64VLQ", () => {
  it("should return expected number if input is char", () => {
    const table: [char: string, expected: number][] = [
      ["A", 0],
      ["C", 1],
      ["G", 3],
      ["O", 7],
    ];

    for (const [segment, expected] of table) {
      expect(decodeBase64VLQ(segment, { value: 0 })).toEqual(expected);
    }
  });
});

describe("optionallyGetString", () => {
  it("should return null if the key does not exist", () => {
    expect(optionallyGetString("", new Map())).toBe(null);
  });

  it("should return string if the key exist and the value is string", () => {
    const map = new Map();
    const key = "key";
    const value = "value";
    map.set(key, value);

    expect(optionallyGetString(key, map)).toBe(value);
  });

  it("should throw error if the key exist but the value is not string", () => {
    const map = new Map();
    const key = "key";
    const value = 0;
    map.set(key, value);

    expect(() => optionallyGetString(key, map)).toThrow();
  });
});

describe("optionallyGetStringList", () => {
  it("should return empty list if the key does not exist", () => {
    expect(optionallyGetStringList("", new Map())).toEqual(new List());
  });

  it("should return mapped list if the key exists", () => {
    const map = new Map();
    const key = "key";
    const value = new List(["value"]);

    map.set(key, value);
    expect(optionallyGetStringList(key, map)).toEqual(new List(["value"]));
  });

  it("should return list what includes empty string if the item is not string", () => {
    const map = new Map();
    const key = "key";
    const value = new List(["value", 0, {}]);

    map.set(key, value);
    expect(optionallyGetStringList(key, map)).toEqual(
      new List(["value", "", ""]),
    );
  });

  it("should throw error if the value is not list", () => {
    const map = new Map();
    const key = "key";

    map.set(key, "");
    expect(() => optionallyGetStringList(key, map)).toThrow();
  });
});

describe("optionallyGetOptionallyStringList", () => {
  it("should return empty list if the key does not exist", () => {
    expect(optionallyGetOptionallyStringList("", new Map())).toEqual(
      new List(),
    );
  });

  it("should return mapped list if the key exists", () => {
    const map = new Map();
    const key = "key";
    const value = new List(["value", null]);

    map.set(key, value);
    expect(optionallyGetOptionallyStringList(key, map)).toEqual(
      new List(["value", null]),
    );
  });

  it("should throw error if the item is not string or null", () => {
    const map = new Map();
    const key = "key";
    const value = new List(["value", 0]);

    map.set(key, value);
    expect(() => optionallyGetOptionallyStringList(key, map)).toThrow();
  });

  it("should throw error if the value is not list", () => {
    const map = new Map();
    const key = "key";

    map.set(key, "");
    expect(() => optionallyGetOptionallyStringList(key, map)).toThrow();
  });
});

describe("optionallyGetArrayIndexList", () => {
  it("should return empty list if the key does not exist", () => {
    expect(optionallyGetArrayIndexList("", new Map())).toEqual(
      new List(),
    );
  });

  it("should return mapped list if the key exists", () => {
    const map = new Map();
    const key = "key";
    const value = new List([0, 1, null]);

    map.set(key, value);
    expect(optionallyGetArrayIndexList(key, map)).toEqual(
      new List([0, 1, null]),
    );
  });

  it("should throw error if the item is not number or null", () => {
    const map = new Map();
    const key = "key";
    const value = new List(["value"]);

    map.set(key, value);
    expect(() => optionallyGetArrayIndexList(key, map)).toThrow();
  });

  it("should throw error if the item is not non-negative integer", () => {
    const map = new Map();
    const key = "key";
    const value = new List([0.1, -1]);

    map.set(key, value);
    expect(() => optionallyGetArrayIndexList(key, map)).toThrow();
  });

  it("should throw error if the value is not list", () => {
    const map = new Map();
    const key = "key";

    map.set(key, "");
    expect(() => optionallyGetArrayIndexList(key, map)).toThrow();
  });
});
