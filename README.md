# source-map

> 🚧 WIP at [beta branch](https://github.com/TomokiMiyauci/source-map/tree/beta)

[Source Map](https://tc39.es/source-map/), based on TC39 spec reference
implementation.

Based on 18 September 2024 update.

## Table of Contents <!-- omit in toc -->

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Contributing](#contributing)
- [License](#license)

## Install

deno:

```bash
deno add @miyauci/source-map
```

node:

```bash
npx jsr add @miyauci/source-map
```

## Usage

Here are some modules.

`decodeSourceMapFromJSONString` is the implementation of
[decode a source map from a JSON string](https://tc39.es/source-map/#decode-a-source-map-from-a-json-string).

```ts
import { decodeSourceMapFromJSONString } from "@miyauci/source-map";

const sourceMap = `{
  "version": 3,
  "file": "helloworld.js",
  "sources": [
    "helloworld.coffee"
  ],
  "names": [],
  "mappings": "AAAA;AAAA,EAAA,OAAO,CAAC,GAAR,CAAY,aAAZ,CAAA,CAAA;AAAA"
}`;
declare const baseURL: URL;

const decodedSourceMap = decodeSourceMapFromJSONString(sourceMap, baseURL);
```

`extractSourceMapURLWithoutParsing` is the implementation of
[extract a Source Map URL from JavaScript without parsing](https://tc39.es/source-map/#extract-a-source-map-url-from-javascript-without-parsing).

```ts
import { extractSourceMapURLWithoutParsing } from "@miyauci/source-map";
import { expect } from "@std/expect";

const source = `// Here is source code

//# sourceMappingURL=foo.js.map
`;

const urlString = extractSourceMapURLWithoutParsing(source);
expect(urlString).toBe("foo.js.map");
```

For all modules, see [API](#api) section.

## API

See [jsr doc](https://jsr.io/@miyauci/source-map) for all APIs.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

[MIT](LICENSE) © 2024 Tomoki Miyauchi
