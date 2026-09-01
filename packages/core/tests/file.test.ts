import { describe, it, expect } from "vitest";
import {
  formatBytes,
  getFileExtension,
  isSupportedFile,
  readFileAsArrayBuffer,
  readFileAsText,
  blobToFile,
  uniqueFileName,
} from "../src/utils/file";

function makeFile(name: string, type: string): File {
  return new File(["content"], name, { type });
}

describe("formatBytes", () => {
  it("formats zero and small values", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
  });
  it("formats KB/MB with one decimal", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(1.5 * 1024 * 1024)).toBe("1.5 MB");
  });
});

describe("getFileExtension", () => {
  it("lowercases and strips the dot", () => {
    expect(getFileExtension("photo.JPG")).toBe("jpg");
    expect(getFileExtension("a.b.c")).toBe("c");
  });
  it("handles names without an extension", () => {
    expect(getFileExtension("noext")).toBe("");
    expect(getFileExtension("trailing.")).toBe("");
  });
});

describe("isSupportedFile", () => {
  it("accepts everything when no filter is given", () => {
    expect(isSupportedFile(makeFile("a.png", "image/png"), [])).toBe(true);
  });
  it("matches by exact MIME type", () => {
    expect(isSupportedFile(makeFile("a.png", "image/png"), ["image/png"])).toBe(true);
    expect(isSupportedFile(makeFile("a.png", "image/png"), ["application/pdf"])).toBe(false);
  });
  it("matches by MIME wildcard", () => {
    expect(isSupportedFile(makeFile("a.png", "image/png"), ["image/*"])).toBe(true);
    expect(isSupportedFile(makeFile("a.png", "image/png"), ["text/*"])).toBe(false);
  });
  it("matches by extension, case-insensitively", () => {
    expect(isSupportedFile(makeFile("photo.JPG", "image/jpeg"), [".jpg"])).toBe(true);
    expect(isSupportedFile(makeFile("a.png", "image/png"), ["pdf"])).toBe(false);
  });
});

describe("file reads", () => {
  const file = new File(["hello world"], "a.txt", { type: "text/plain" });

  it("reads text", async () => {
    expect(await readFileAsText(file)).toBe("hello world");
  });
  it("reads as an ArrayBuffer of the right length", async () => {
    const buffer = await readFileAsArrayBuffer(file);
    expect(buffer.byteLength).toBe("hello world".length);
  });
});

describe("blobToFile & uniqueFileName", () => {
  it("wraps a blob in a File", () => {
    const blob = new Blob(["x"], { type: "text/plain" });
    const file = blobToFile(blob, "out.txt");
    expect(file.name).toBe("out.txt");
    expect(file.type).toBe("text/plain");
  });
  it("generates a unique file name preserving the extension", () => {
    const name = uniqueFileName("report.pdf");
    expect(name).toMatch(/^report-\d+\.pdf$/);
  });
});