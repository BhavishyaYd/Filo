/**
 * File-handling helpers shared across tools.
 *
 * Tools should route reads/writes through these wrappers rather than
 * touching browser APIs directly. That keeps the same code usable from a
 * future desktop or server surface without a rewrite.
 */

/** Format a byte count for display, e.g. `1536` → `"1.5 KB"`. */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), units.length - 1);
  const value = bytes / k ** i;
  return `${value.toFixed(i === 0 ? 0 : decimals)} ${units[i]}`;
}

/** Lowercased extension of a file name, without the dot (`"photo.JPG"` → `"jpg"`). */
export function getFileExtension(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  return idx === -1 || idx === fileName.length - 1 ? "" : fileName.slice(idx + 1).toLowerCase();
}

/** True if a single `accepted` entry matches the file (MIME, `image/*`, `*.ext`, or bare ext). */
function matchesEntry(file: File, entry: string): boolean {
  const pattern = entry.trim().toLowerCase();
  if (!pattern || pattern === "*" || pattern === "application/octet-stream") return true;

  if (pattern.endsWith("/*")) {
    return file.type.toLowerCase().startsWith(pattern.slice(0, -1));
  }
  if (pattern.includes("/")) {
    return file.type.toLowerCase() === pattern;
  }
  return getFileExtension(file.name) === pattern.replace(/^\./, "");
}

/**
 * True if the file is accepted by the tool's accepted-file list.
 * An empty/absent list accepts everything.
 */
export function isSupportedFile(file: File, accepted: string[]): boolean {
  if (!accepted || accepted.length === 0) return true;
  return accepted.some((entry) => matchesEntry(file, entry));
}

/** Typed read helpers that always return a fresh promise (never reject on empty). */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer();
}

export function readFileAsText(file: File): Promise<string> {
  return file.text();
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

/** Trigger a browser download of a Blob. Browser-only by nature. */
export function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** Wrap a Blob (e.g. a tool's output) back into a File for uniform handling. */
export function blobToFile(blob: Blob, fileName: string, type = blob.type): File {
  return new File([blob], fileName, { type });
}

/** Generate a non-colliding output name: `"report.pdf"` → `"report-1725….pdf"`. */
export function uniqueFileName(base: string): string {
  const dot = base.lastIndexOf(".");
  const ext = dot === -1 ? "" : base.slice(dot);
  const name = dot === -1 ? base : base.slice(0, dot);
  return `${name}-${Date.now()}${ext}`;
}