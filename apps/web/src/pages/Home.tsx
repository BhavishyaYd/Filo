import { useMemo } from "react";
import { Link } from "react-router-dom";
import { getTools, type ToolCategory } from "@filo/core";

/**
 * Tools announced for upcoming phases. Shown as muted "planned" chips so
 * the catalog page is honest: these exist on the roadmap, not in the app.
 * Real tools come from the registry and are rendered as active cards.
 */
const PLANNED: Record<ToolCategory, string[]> = {
  pdf: ["Merge", "Compress", "PDF ↔ JPG/PNG", "Split", "Rotate", "Watermark"],
  image: ["Compress", "Convert", "Resize", "Crop", "Grayscale", "Background removal"],
  document: ["DOCX ↔ PDF", "TXT → PDF", "Markdown → PDF", "CSV ↔ XLSX"],
  dev: ["JSON formatter", "Base64", "Hash generator", "JWT decoder", "UUID generator"],
  utility: ["Unit converter", "Password generator", "QR generator"],
};

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  pdf: "PDF",
  image: "Images",
  document: "Documents",
  dev: "Developer",
  utility: "Utilities",
};

const CATEGORY_ICONS: Record<ToolCategory, string> = {
  pdf: "📄",
  image: "🖼️",
  document: "📑",
  dev: "🛠️",
  utility: "⚙️",
};

export default function Home() {
  const tools = useMemo(() => getTools(), []);

  return (
    <div>
      {/* Hero */}
      <section className="pb-10 text-center">
        <h1 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          File tools that never leave your device.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-600">
          Filo is a free, open-source toolkit for PDF, image, document, and developer
          files. Everything runs in your browser.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-medium">
          {["No uploads", "No accounts", "No ads", "100% client-side"].map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600"
            >
              {badge}
            </span>
          ))}
        </div>
      </section>

      {/* Active tools */}
      {tools.length > 0 && (
        <section className="mb-10">
          <div className="grid gap-4 sm:grid-cols-2">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                to={`/tool/${tool.id}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-lg">{CATEGORY_ICONS[tool.category]}</span>
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {CATEGORY_LABELS[tool.category]}
                  </span>
                  {tool.runsClientSide && (
                    <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      in-browser
                    </span>
                  )}
                </div>
                <h2 className="text-base font-semibold text-slate-900">{tool.label}</h2>
                <p className="mt-1 text-sm text-slate-500">{tool.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Roadmap / planned */}
      <section>
        <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-slate-500">
          {tools.length > 0 ? "More on the way" : "Building the toolkit"}
        </h2>
        <p className="mx-auto mb-6 max-w-md text-center text-sm text-slate-500">
          {tools.length > 0
            ? "Every tool is a self-contained module — the next batch is already planned."
            : "The first tools are being built. Here's what the catalog will look like."}
        </p>

        {Object.entries(PLANNED).map(([category, items]) => (
          <div key={category} className="mb-4">
            <h3 className="mb-2 text-sm font-medium text-slate-700">
              {CATEGORY_ICONS[category as ToolCategory]} {CATEGORY_LABELS[category as ToolCategory]}
            </h3>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <span
                  key={item}
                  className="cursor-default rounded-lg border border-dashed border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-400"
                  title="Planned — not available yet"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}