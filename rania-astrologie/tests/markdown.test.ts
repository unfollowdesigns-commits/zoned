import assert from "node:assert/strict";
import { test } from "node:test";
import { renderMarkdown } from "../src/lib/markdown.ts";
import { sniffImage } from "../src/lib/image-sniff.ts";

test("markdown is rendered and sanitised", () => {
  const html = renderMarkdown("## Titre\n\n<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[a](javascript:alert(1)) [b](https://example.com)");
  assert.match(html, /<h2>Titre<\/h2>/);
  assert.doesNotMatch(html, /<script|onerror|javascript:/);
  assert.match(html, /href="https:\/\/example.com" rel="noopener noreferrer nofollow" target="_blank"/);
});

test("image type is sniffed from magic bytes, not trusted from the client", () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  const html = new TextEncoder().encode("<html><script>");
  assert.equal(sniffImage(png), "image/png");
  assert.equal(sniffImage(html), null);
});
