export type HTTPSScheme = "http" | "https";

export function isHttpsScheme(input: string): input is HTTPSScheme {
  return input === "http" || input === "https";
}

export type HTTPNewLine = 0x0A | 0x0D;

export function isHTTPNewLine(input: number): input is HTTPNewLine {
  return input === 0x0A || input === 0x0D;
}
