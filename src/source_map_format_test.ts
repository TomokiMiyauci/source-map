import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import { decodeBase64VLQ } from "./source_map_format.ts";

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
