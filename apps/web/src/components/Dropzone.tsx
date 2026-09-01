import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent, KeyboardEvent } from "react";
import { formatBytes, isSupportedFile } from "@filo/core";

interface DropzoneProps {
  /** Currently selected files (controlled by the parent). */
  value: File[];
  /** Called with the new full list whenever selection changes. */
  onChange: (files: File[]) => void;
  /** Accepted MIME types / `"*.ext"` patterns. Empty = accept anything. */
  accept?: string[];
  multiple?: boolean;
  maxFiles?: number;
  disabled?: boolean;
}

/**
 * Reusable drag-and-drop file input, used by every tool page.
 *
 * Presentational and controlled: the parent owns the file list and passes
 * it in, so tools can reset/replace selection freely. Unsupported files are
 * filtered out and reported rather than silently accepted.
 */
export default function Dropzone({
  value,
  onChange,
  accept = [],
  multiple = true,
  maxFiles,
  disabled = false,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [rejectNotice, setRejectNotice] = useState<string | null>(null);

  const addFiles = (incoming: Iterable<File>) => {
    const candidates = Array.from(incoming);
    const valid = candidates.filter((file) => isSupportedFile(file, accept));
    const skipped = candidates.length - valid.length;

    if (skipped > 0) {
      setRejectNotice(
        `Skipped ${skipped} file${skipped === 1 ? "" : "s"} — type not supported here.`,
      );
    } else {
      setRejectNotice(null);
    }
    if (valid.length === 0) return;

    let next = multiple ? [...value, ...valid] : [...valid];
    if (maxFiles) next = next.slice(0, maxFiles);
    onChange(next);
  };

  const openPicker = () => inputRef.current?.click();

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);
    if (!disabled) addFiles(event.dataTransfer.files);
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepth.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setIsDragging(false);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => event.preventDefault();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = ""; // allow re-selecting the same file
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  };

  const removeFile = (index: number) => onChange(value.filter((_, i) => i !== index));

  const baseClasses =
    "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors " +
    (disabled
      ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
      : isDragging
        ? "cursor-copy border-indigo-500 bg-indigo-50"
        : "cursor-pointer border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/40");

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Add files"
        onClick={() => !disabled && openPicker()}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        className={baseClasses}
      >
        <svg
          className="h-10 w-10 text-indigo-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
          />
        </svg>
        <p className="text-base font-medium text-slate-800">
          Drag &amp; drop{multiple ? " files" : " a file"} here
          <span className="font-normal text-slate-500"> or click to browse</span>
        </p>
        {accept.length > 0 && (
          <p className="text-xs text-slate-400">Accepts {accept.join(", ")}</p>
        )}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept.join(",")}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
        />
      </div>

      {rejectNotice && <p className="mt-2 text-sm text-red-600">{rejectNotice}</p>}

      {value.length > 0 && (
        <ul className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {value.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 px-4 py-2.5"
            >
              <svg
                className="h-4 w-4 shrink-0 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
              <span className="flex-1 truncate text-sm font-medium text-slate-800">
                {file.name}
              </span>
              <span className="text-xs tabular-nums text-slate-400">
                {formatBytes(file.size)}
              </span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                aria-label={`Remove ${file.name}`}
                className="rounded p-1 text-slate-300 transition-colors hover:text-red-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}