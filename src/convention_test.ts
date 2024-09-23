import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import {
  extractSourceMapURLWithoutParsing,
  matchSourceMapURLInComment,
} from "./convention.ts";

describe("extractSourceMapURLWithoutParsing", () => {
  it("should return null if not match pattern", () => {
    expect(extractSourceMapURLWithoutParsing("")).toBeNull();
  });

  it("should return string if match pattern", () => {
    expect(extractSourceMapURLWithoutParsing(`//

//# sourceMappingURL=foo.js`)).toBe("foo.js");
  });
});

describe("matchSourceMapURLInComment", () => {
  it("should return null if not match pattern", () => {
    expect(matchSourceMapURLInComment("")).toBeNull();
  });

  it("should return string if match pattern", () => {
    expect(matchSourceMapURLInComment(`# sourceMappingURL=foo.js`)).toBe(
      "foo.js",
    );
    expect(matchSourceMapURLInComment(`@ sourceMappingURL=foo.js`)).toBe(
      "foo.js",
    );
  });
});
