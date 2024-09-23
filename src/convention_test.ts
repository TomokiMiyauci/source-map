import { expect } from "@std/expect";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import {
  extractSourceMapURLWithoutParsing,
  fetchSourceMap,
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

describe("fetchSourceMap", () => {
  it("should return source map with file url", async () => {
    const url = new URL(
      import.meta.resolve("../tests/fixtures/sourcemap.js.map"),
    );

    const sourceMap = await fetchSourceMap(url);

    expect(sourceMap).toEqual({
      version: 3,
      file: "helloworld.js",
      mappings: "AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA",
      names: [],
      sources: [
        "helloworld.coffee",
      ],
    });
  });

  describe("HTTP related", () => {
    interface Context {
      url: URL;
      server: Deno.HttpServer<Deno.NetAddr>;
    }

    const url = new URL(
      import.meta.resolve("../tests/fixtures/escaped_sourcemap.txt"),
    );

    beforeEach<Context>(async function () {
      const port = 8000;
      const sourcemap = await Deno.readTextFile(url);

      this.server = Deno.serve({ port, onListen() {} }, () => {
        return new Response(sourcemap);
      });

      this.url = new URL(`http://localhost:${port}`);
    });

    afterEach<Context>(async function () {
      await this.server.shutdown();
    });

    it<Context>("should return source map with http url", async function () {
      const sourceMap = await fetchSourceMap(this.url);

      expect(sourceMap).toEqual({
        version: 3,
        file: "helloworld.js",
        mappings: "AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA",
        names: [],
        sources: [
          "helloworld.coffee",
        ],
      });
    });
  });
});
