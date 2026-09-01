import { useCallback, useMemo, useState } from "react";
import type { FiloTool, FiloToolOption } from "@filo/core";
import { formatBytes, triggerDownload } from "@filo/core";
import Dropzone from "./Dropzone";
import { useToolOptions } from "../lib/useToolOptions";

type Stage = "upload" | "options" | "ready" | "processing" | "done";

interface OutputEntry {
  name: string;
  size: number;
  blob: Blob;
}

const BUTTON =
  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors";

function OptionControl({
  def,
  value,
  onChange,
}: {
  def: FiloToolOption;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (def.type) {
    case "checkbox":
      return (
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={Boolean(value ?? def.default)}
            onChange={(event) => onChange(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-indigo-600"
          />
          <span>
            <span className="text-sm font-medium text-slate-800">{def.label}</span>
            {def.help && <span className="block text-xs text-slate-500">{def.help}</span>}
          </span>
        </label>
      );
    case "select":
      return (
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-800">{def.label}</span>
          <select
            value={String(value ?? def.default ?? "")}
            onChange={(event) => onChange(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
          >
            {(def.choices ?? []).map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
          {def.help && <span className="mt-1 block text-xs text-slate-500">{def.help}</span>}
        </label>
      );
    case "range":
      return (
        <label className="block">
          <span className="mb-1 flex items-center justify-between text-sm font-medium text-slate-800">
            <span>{def.label}</span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs tabular-nums text-slate-600">
              {String(value ?? def.default)}
            </span>
          </span>
          <input
            type="range"
            min={def.min}
            max={def.max}
            step={def.step}
            value={Number(value ?? def.default ?? 0)}
            onChange={(event) => onChange(Number(event.target.value))}
            className="w-full accent-indigo-600"
          />
          {def.help && <span className="mt-1 block text-xs text-slate-500">{def.help}</span>}
        </label>
      );
    case "number":
      return (
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-800">{def.label}</span>
          <input
            type="number"
            min={def.min}
            max={def.max}
            step={def.step}
            placeholder={def.placeholder}
            value={String(value ?? def.default ?? "")}
            onChange={(event) => onChange(Number(event.target.value))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
          />
          {def.help && <span className="mt-1 block text-xs text-slate-500">{def.help}</span>}
        </label>
      );
    default: // text
      return (
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-800">{def.label}</span>
          <input
            type="text"
            placeholder={def.placeholder}
            value={String(value ?? def.default ?? "")}
            onChange={(event) => onChange(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
          />
          {def.help && <span className="mt-1 block text-xs text-slate-500">{def.help}</span>}
        </label>
      );
  }
}

/**
 * The generic tool page.
 *
 * Takes any {@link FiloTool} and renders the standard flow every tool
 * shares: upload files → tweak options → process → download results.
 * Tools never ship their own page — they just plug in here.
 */
export default function ToolPage({ tool }: { tool: FiloTool }) {
  const hasOptions = useMemo(() => (tool.options?.length ?? 0) > 0, [tool.options]);
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<Stage>("upload");
  const [outputs, setOutputs] = useState<OutputEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { values, setValue } = useToolOptions(tool.options);

  const continueToOptionsOrReady = useCallback(() => {
    setStage(hasOptions ? "options" : "ready");
  }, [hasOptions]);

  const handleFilesChanged = useCallback(
    (next: File[]) => {
      setFiles(next);
      setError(null);
      setOutputs([]);
      if (next.length === 0) setStage("upload");
      else continueToOptionsOrReady();
    },
    [continueToOptionsOrReady],
  );

  const handleProcess = useCallback(async () => {
    setStage("processing");
    setError(null);
    try {
      const result = await tool.run(files, values);
      const list = Array.isArray(result) ? result : [result];
      if (list.length === 0) throw new Error("The tool produced no output files.");
      setOutputs(
        list.map((file) => ({ name: file.name, size: file.size, blob: file })),
      );
      setStage("done");
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Something went wrong while processing.";
      setError(message);
      setStage(files.length > 0 ? (hasOptions ? "options" : "ready") : "upload");
    }
  }, [files, hasOptions, tool, values]);

  const handleStartOver = useCallback(() => {
    setFiles([]);
    setOutputs([]);
    setError(null);
    setStage("upload");
  }, []);

  const steps = hasOptions
    ? (["upload", "options", "done"] as const)
    : (["upload", "done"] as const);
  const stepIndex =
    stage === "done"
      ? steps.length - 1
      : stage === "upload"
        ? 0
        : hasOptions
          ? 1
          : 0;

  const spinner = (
    <svg className="h-6 w-6 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <header className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-indigo-600">
            {tool.category}
          </span>
          {tool.runsClientSide && (
            <span
              className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
              title="Processing happens in your browser — files never leave this device."
            >
              🔒 runs in your browser
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{tool.label}</h1>
        <p className="mt-1 text-sm text-slate-500">{tool.description}</p>
      </header>

      {/* Step indicator */}
      <ol className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-500">
        {steps.map((step, index) => {
          const isDone = index < stepIndex;
          const isActive = index === stepIndex;
          return (
            <li key={step} className="flex items-center gap-2">
              {index > 0 && <span className="h-px w-6 bg-slate-300" aria-hidden="true" />}
              <span
                className={
                  "flex items-center gap-1.5 rounded-full px-3 py-1 " +
                  (isDone
                    ? "bg-indigo-600 text-white"
                    : isActive
                      ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-300"
                      : "bg-slate-100 text-slate-400")
                }
              >
                {isDone ? "✓" : index + 1} {step[0].toUpperCase() + step.slice(1)}
              </span>
            </li>
          );
        })}
      </ol>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Stage: upload */}
      {(stage === "upload" || stage === "options" || stage === "ready") && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Dropzone
            value={files}
            onChange={handleFilesChanged}
            accept={tool.acceptedFileTypes}
            multiple={tool.maxFiles === undefined || tool.maxFiles > 1}
            maxFiles={tool.maxFiles}
          />

          {stage === "upload" && files.length > 0 && (
            <button
              type="button"
              onClick={continueToOptionsOrReady}
              className={`${BUTTON} mt-4 bg-indigo-600 text-white hover:bg-indigo-700`}
            >
              Continue →
            </button>
          )}

          {stage === "options" && (
            <div className="mt-6 border-t border-slate-100 pt-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Options
              </h2>
              <div className="grid gap-5">
                {tool.options?.map((def) => (
                  <OptionControl
                    key={def.key}
                    def={def}
                    value={values[def.key]}
                    onChange={(next) => setValue(def.key, next)}
                  />
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStage("upload")}
                  className={`${BUTTON} text-slate-600 hover:bg-slate-100`}
                >
                  ← Change files
                </button>
                <button
                  type="button"
                  onClick={handleProcess}
                  className={`${BUTTON} bg-indigo-600 text-white hover:bg-indigo-700`}
                >
                  Process {files.length} file{files.length === 1 ? "" : "s"}
                </button>
              </div>
            </div>
          )}

          {stage === "ready" && !hasOptions && (
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={() => setStage("upload")}
                className={`${BUTTON} text-slate-600 hover:bg-slate-100`}
              >
                ← Change files
              </button>
              <button
                type="button"
                onClick={handleProcess}
                className={`${BUTTON} bg-indigo-600 text-white hover:bg-indigo-700`}
              >
                Process {files.length} file{files.length === 1 ? "" : "s"}
              </button>
            </div>
          )}
        </section>
      )}

      {/* Stage: processing */}
      {stage === "processing" && (
        <section className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          {spinner}
          <p className="text-sm font-medium text-slate-700">
            Processing {files.length} file{files.length === 1 ? "" : "s"}…
          </p>
          <p className="text-xs text-slate-400">
            {tool.runsClientSide
              ? "All done locally — nothing has been uploaded."
              : "This may involve a server round-trip."}
          </p>
        </section>
      )}

      {/* Stage: done */}
      {stage === "done" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">
              {outputs.length} file{outputs.length === 1 ? "" : "s"} ready for download
            </h2>
            {outputs.length > 1 && (
              <button
                type="button"
                onClick={() => outputs.forEach((out) => triggerDownload(out.blob, out.name))}
                className={`${BUTTON} bg-slate-900 text-white hover:bg-slate-700`}
              >
                Download all
              </button>
            )}
          </div>
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {outputs.map((out, index) => (
              <li key={`${out.name}-${index}`} className="flex items-center gap-3 px-4 py-3">
                <svg
                  className="h-4 w-4 shrink-0 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span className="flex-1 truncate text-sm font-medium text-slate-800">
                  {out.name}
                </span>
                <span className="text-xs tabular-nums text-slate-400">
                  {formatBytes(out.size)}
                </span>
                <button
                  type="button"
                  onClick={() => triggerDownload(out.blob, out.name)}
                  className={`${BUTTON} bg-indigo-600 text-white hover:bg-indigo-700`}
                >
                  Download
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={handleStartOver}
            className={`${BUTTON} mt-4 text-slate-600 hover:bg-slate-100`}
          >
            Start over
          </button>
        </section>
      )}
    </div>
  );
}