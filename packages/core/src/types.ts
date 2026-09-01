/**
 * Core type definitions shared across all Filo packages.
 *
 * Every tool — PDF, image, document, dev, utility — implements the same
 * {@link FiloTool} interface and is registered with the plugin registry.
 * The core app (and any future desktop shell) only ever sees tools through
 * this interface, which is what keeps the whole system modular.
 */

/** The coarse buckets used to organize tools on the site. */
export const TOOL_CATEGORIES = [
  "pdf",
  "image",
  "document",
  "dev",
  "utility",
] as const;

export type ToolCategory = (typeof TOOL_CATEGORIES)[number];

/**
 * A single configurable option a tool may expose.
 *
 * Tools declare their options declaratively; the generic tool page renders
 * controls from these definitions and passes the collected values back as
 * an options {@link Record} into {@link FiloTool.run}.
 */
export interface FiloToolOption {
  /** Unique key within the tool, e.g. `"quality"`. */
  key: string;
  /** Human-readable label shown next to the control. */
  label: string;
  type: "text" | "number" | "range" | "checkbox" | "select";
  /** Default value when the tool loads. */
  default?: string | number | boolean;
  /** Shown as muted helper text under the control. */
  help?: string;
  placeholder?: string;
  /** For `number` / `range` controls. */
  min?: number;
  max?: number;
  step?: number;
  /** For `select` controls. */
  choices?: { label: string; value: string }[];
}

/**
 * The one contract every Filo tool implements.
 *
 * A tool is a pure function of its inputs: {@link run} receives the user's
 * files plus their chosen options and returns Blob-like output files. The
 * registry + generic tool page handle everything around it (upload UI,
 * option controls, downloads).
 */
export interface FiloTool {
  /** Stable identifier, e.g. `"pdf-merge"`. Serves as the URL slug. */
  id: string;
  category: ToolCategory;
  label: string;
  description: string;
  /** MIME types (or `"*.ext"` patterns) this tool accepts. */
  acceptedFileTypes: string[];
  /** True if processing happens fully in the browser (no upload). */
  runsClientSide: boolean;
  /** Cap on simultaneous input files; defaults to unlimited. */
  maxFiles?: number;
  /** Optional declarative options rendered by the generic tool page. */
  options?: readonly FiloToolOption[];
  /**
   * Perform the transformation.
   *
   * @param input   The user-selected files.
   * @param options Collected option values keyed by {@link FiloToolOption.key}.
   * @returns       One or more output files (File or Blob).
   */
  run: (input: File[], options: Record<string, unknown>) => Promise<File | File[]>;
}