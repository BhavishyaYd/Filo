import { useMemo } from "react";
import { Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import { getTool } from "@filo/core";
import "./tools"; // registers all tool packages at startup (side effect)
import Home from "./pages/Home";
import ToolPage from "./components/ToolPage";

function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            F
          </span>
          Filo
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-slate-900">
            Tools
          </Link>
          <a
            href="https://github.com/BhavishyaYd/Filo"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-900"
          >
            GitHub ↗
          </a>
        </nav>
      </div>
    </header>
  );
}

function ToolRoute() {
  const { toolId } = useParams();
  const tool = useMemo(() => (toolId ? getTool(toolId) : undefined), [toolId]);

  if (!tool) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="mb-2 text-4xl">🧪</p>
        <h1 className="text-lg font-semibold text-slate-900">Tool not found</h1>
        <p className="mt-1 text-sm text-slate-500">
          <code className="rounded bg-slate-100 px-1 py-0.5">/{toolId}</code> isn't
          registered yet. Tools appear here as soon as their package registers in{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5">packages/tools</code>.
        </p>
        <Link to="/" className="mt-5 inline-block text-sm font-semibold text-indigo-600 hover:underline">
          ← Back to tools
        </Link>
      </div>
    );
  }

  return <ToolPage key={tool.id} tool={tool} />;
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tool/:toolId" element={<ToolRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row">
          <p>
            Filo — free &amp; open source. Your files never leave your device.
          </p>
          <a
            href="https://github.com/BhavishyaYd/Filo"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-slate-600 hover:text-slate-900"
          >
            Star on GitHub ⭐
          </a>
        </div>
      </footer>
    </div>
  );
}