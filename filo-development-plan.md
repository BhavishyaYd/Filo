# Filo — Development Plan

**Project:** Filo — an all-in-one, privacy-first file modification & conversion tool
**Positioning:** Client-side-first alternative to iLovePDF / TinyPNG / CloudConvert. Most operations run entirely in the browser (WASM) — files never leave the user's device. Open source.

**Platform decision:** Web app (not desktop). No-install friction is critical for a "quick tool" product, and the "your files never leave your device" privacy claim is actually more provable/trustworthy as a browser app than a desktop one. Since the core logic runs on WASM/browser APIs, a lightweight **Tauri** desktop wrapper is a realistic stretch goal later (Phase 6+) without a rewrite — not needed for MVP.

---

## 1. Goals & Principles

- **Privacy by default:** process files client-side wherever technically possible. Server-side only when a browser-capable library genuinely doesn't exist yet.
- **No account required** for any single-file, single-operation tool. Accounts (later, optional) only for saved presets / batch history.
- **Modular architecture:** every tool is an isolated module (own folder, own logic, own tests) so new tools can be added without touching the core app.
- **Fast, minimal UI:** drag-and-drop first, sensible defaults, no dark patterns, no forced ads blocking the actual tool.

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | **React + TypeScript + Vite** | Fast dev loop, huge ecosystem for the WASM libraries below |
| Styling | **Tailwind CSS** | Fast to build consistent UI across many small tool pages |
| Client-side PDF | **pdf-lib** + **pdf.js** | pdf-lib for creation/editing (merge, split, watermark, page ops); pdf.js for rendering/preview |
| Client-side images | **browser-image-compression**, native **Canvas API**, **@squoosh/lib** (or wasm-vips) | Compression, resize, crop, format conversion, grayscale all doable in-browser |
| Client-side OCR | **Tesseract.js** | Runs OCR fully client-side via WASM |
| Client-side dev tools | Hand-rolled + small libs (**jose** for JWT, **uuid**, **js-yaml**, **crypto-js** or native `SubtleCrypto` for hashing) | All lightweight, no server needed |
| Server-side (only where needed) | **Node.js + Express (or Fastify)** | For DOCX↔PDF (via LibreOffice headless or a document-conversion API), background removal (rembg or a hosted model), and any format WASM can't yet handle |
| Background removal | **rembg** (Python, self-hosted) or a client-side ONNX model if feasible | Start server-side, evaluate moving to WASM/ONNX Runtime Web later |
| File handling | Native **File System Access API** where supported, fallback to standard file input/drag-drop | |
| Deployment | **Vercel** (frontend + serverless functions for the light server-side bits) | You already use this for CineSeeker — consistent workflow |
| Testing | **Vitest** + **Playwright** (for drag-drop/UI flows) | |

---

## 3. Architecture

```
/filo
  /apps
    /web                → main React app
  /packages
    /core                → shared types, file-handling utils, plugin registry
    /tools
      /pdf-merge
      /pdf-split
      /pdf-compress
      /image-convert
      /image-compress
      /json-formatter
      /base64
      ...one folder per tool, each exporting a standard interface
  /server                → minimal API for the few server-side-only operations
```

**Plugin interface (every tool implements this):**
```ts
interface FiloTool {
  id: string;                // "pdf-merge"
  category: "pdf" | "image" | "document" | "dev" | "utility";
  label: string;
  description: string;
  acceptedFileTypes: string[];
  runsClientSide: boolean;
  run: (input: File[], options: Record<string, unknown>) => Promise<File | File[]>;
}
```

This keeps the core app dumb — it just renders a tool page from the registry and calls `.run()`. Adding a new tool never requires touching routing or layout code.

---

## 4. Phased Roadmap

### Phase 0 — Foundation (before any tool)
- Set up monorepo (Turborepo or simple npm workspaces)
- Build the plugin registry + shared `FiloTool` interface
- Build one generic "tool page" template (upload → options → process → download) that any tool can plug into
- Set up drag-and-drop file input component (reusable across all tools)

### Phase 1 — MVP (ship first, covers ~80% of real demand)
Pick these 6 first — highest usage, all client-side-only, no server needed:
1. PDF Merge
2. PDF Compress
3. PDF ↔ JPG/PNG
4. Image Compress
5. Image Convert (JPG ↔ PNG ↔ WebP)
6. JSON Formatter/Validator

**Goal:** working deployed site with these 6 tools, clean UI, before adding anything else.

### Phase 2 — Round out PDF + Images
- PDF: split, rotate, reorder/delete pages, extract pages, watermark, page numbers, password protect/remove
- Images: resize, crop, rotate, grayscale, EXIF/metadata remove, batch processing

### Phase 3 — Developer tools & general utilities
(All client-side, fast to build, good for filling out the catalog quickly)
- XML/YAML formatter, Base64 encode/decode, URL encode/decode, hash generator, UUID generator, JWT decoder, regex tester, timestamp converter
- QR/barcode generator, unit converter, color converter, password generator, text case converter, word/character counter, checksum generator

### Phase 4 — Document conversion (needs server-side pieces)
- DOCX ↔ PDF (LibreOffice headless via serverless function, or a conversion API)
- TXT → PDF, Markdown → HTML/PDF, HTML → PDF
- CSV ↔ XLSX, JSON ↔ CSV

### Phase 5 — Harder/advanced
- OCR scanned PDFs (Tesseract.js — can actually be pulled earlier if it performs well client-side)
- Background removal for images

### Phase 6 — Polish
- Batch/queue processing across tools
- Optional accounts for saved presets & history
- PWA support (offline usage)

---

## 5. Instructions for Claude Code

> Paste this section directly as your first prompt in Claude Code.

```
We are building "Filo" — a client-side-first, privacy-focused, all-in-one file
modification and conversion tool (PDF, image, document, dev-tools, utilities).

Tech stack: React + TypeScript + Vite, Tailwind CSS, pdf-lib, pdf.js,
browser-image-compression, Tesseract.js. Deployed on Vercel. Minimal
serverless backend only for operations that can't run in-browser (DOCX<->PDF,
background removal).

Start with Phase 0: set up the monorepo structure, the shared FiloTool plugin
interface, and one reusable "tool page" template (upload -> options ->
process -> download) with a working drag-and-drop file input.

Do not build any individual tool yet — first give me the skeleton so every
future tool just plugs into the registry. Ask me before choosing between
npm workspaces vs Turborepo.
```

After Phase 0 is done and reviewed, move to Phase 1's 6 MVP tools one at a time — this keeps each Claude Code session scoped and reviewable instead of one giant sprawling task.

---

## 6. Open Decisions (resolve before/during Phase 0)
- [ ] Turborepo vs plain npm workspaces
- [ ] Exact background-removal approach (server now vs. wait for a good client-side ONNX model)
- [ ] Whether Phase 4 (document conversion) needs a real backend server or can stay serverless-function-only
- [ ] Domain name / hosting confirmation for "Filo" (check trademark/availability)
