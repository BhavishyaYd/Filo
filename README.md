GitHub Repo Setup — Filo
Repo name
filo
Short description (GitHub "About" field, 350 char max)
Filo — a free, open-source, all-in-one file toolkit. Convert, compress, merge, and edit PDFs, images, and documents entirely in your browser. Nothing is uploaded — your files never leave your device.
Topics/tags (for discoverability)
pdf-tools  image-converter  file-converter  privacy-first  client-side
webassembly  react  typescript  open-source  developer-tools  productivity
Website field

Your Vercel deployment URL once live (e.g. filo.app or filo.vercel.app).

License

Recommend MIT — permissive, standard for this kind of open-source utility, easiest for others to contribute to or fork.

README.md
markdown
# Filo

**A free, open-source, all-in-one file toolkit — PDF, image, document, and
developer tools that run entirely in your browser.**

No uploads. No accounts. No ads blocking the tool you came for.
Your files never leave your device.

[Live demo](#) · [Report a bug](../../issues) · [Request a feature](../../issues)

---

## Why Filo?

Most free file-conversion sites upload your file to a server, bury the tool
under ads, or paywall basic features. Filo runs almost everything **client-side**
using WebAssembly — the processing happens in your browser, not on a server
you have to trust.

## Features

### 📄 PDF
- Merge, split, compress, rotate pages
- Delete / reorder / extract pages
- PDF ↔ JPG/PNG
- Watermark, page numbers
- Password protect / remove password
- OCR for scanned PDFs

### 🖼️ Images
- Convert: JPG ↔ PNG ↔ WebP ↔ AVIF
- Compress, resize, crop, rotate
- Grayscale conversion
- Strip metadata (EXIF)
- Batch processing
- Background removal

### 📑 Documents
- DOCX ↔ PDF
- TXT → PDF
- Markdown → HTML/PDF
- HTML → PDF
- CSV ↔ XLSX
- JSON ↔ CSV

### 🛠️ Developer tools
- JSON / XML / YAML formatter & validator
- Base64 / URL encode-decode
- Hash generator, UUID generator
- JWT decoder
- Regex tester
- Timestamp converter

### 🔧 General utilities
- QR code / barcode generator
- Unit & color converter
- Password generator
- Text case converter
- Word/character counter
- File checksum generator
- EXIF viewer/remover

> Status: 🚧 in active development — see [Roadmap](#roadmap) below.

## Tech stack

- **Frontend:** React + TypeScript + Vite, Tailwind CSS
- **PDF processing:** pdf-lib, pdf.js
- **Image processing:** Canvas API, browser-image-compression
- **OCR:** Tesseract.js (WASM, runs client-side)
- **Server (minimal, only where browser-side isn't possible):** Node.js serverless functions on Vercel — used for DOCX↔PDF and background removal only
- **Deployment:** Vercel

## Getting started

```bash
git clone https://github.com/BhavishyaYd/filo.git
cd filo
npm install
npm run dev
```

## Project structure

/apps/web → main React app /packages/core → shared types, plugin registry, file-handling utils /packages/tools → one folder per tool (pdf-merge, image-convert, etc.) /server → minimal serverless functions for non-browser-capable ops


Filo uses a plugin architecture — every tool implements a shared `FiloTool`
interface, so adding a new tool never requires touching core routing or layout.

## Roadmap

- [x] Phase 0 — monorepo + plugin architecture + tool-page template
- [ ] Phase 1 — MVP: merge PDF, compress PDF, PDF↔image, image compress, image convert, JSON formatter
- [ ] Phase 2 — full PDF & image tool set
- [ ] Phase 3 — developer tools & general utilities
- [ ] Phase 4 — document conversion (DOCX↔PDF, CSV↔XLSX, etc.)
- [ ] Phase 5 — OCR, background removal
- [ ] Phase 6 — batch/queue processing, optional accounts, PWA/offline support

## Contributing

Contributions are welcome! Since every tool is an isolated module behind a
shared interface, adding a new tool is a self-contained PR. Check open
[issues](../../issues) labeled `good first issue` to get started.
