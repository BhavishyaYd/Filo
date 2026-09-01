/**
 * Tool aggregator — the single place every tool package is imported and
 * registered at startup.
 *
 * Each tool lives in its own workspace package under `packages/tools/`
 * and is registered here with `registerTools`. Adding a tool = add its
 * import + one line here. Nothing else changes (no routing, no layout).
 *
 * Phase 1 example (once `pdf-merge` exists):
 *   import { pdfMergeTool } from "@filo/pdf-merge";
 *   registerTools([pdfMergeTool]);
 */
import { registerTools } from "@filo/core";

const tools = [] as never[];

registerTools(tools);