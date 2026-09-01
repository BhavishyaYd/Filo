import type { FiloTool, ToolCategory } from "./types";

/**
 * The tool registry — an in-memory map of every registered {@link FiloTool}.
 *
 * Tools self-register at app startup (each tool package imports this module
 * and calls {@link registerTool}); the UI then queries the registry when
 * rendering the home grid and tool pages. Nothing else needs to change when
 * a new tool is added.
 */
const registry = new Map<string, FiloTool>();

/**
 * Register a single tool.
 *
 * @throws {Error} if a tool with the same `id` is already registered —
 *   catching duplicate ids at startup prevents silent overriding.
 */
export function registerTool(tool: FiloTool): void {
  if (registry.has(tool.id)) {
    throw new Error(`A tool with id "${tool.id}" is already registered.`);
  }
  registry.set(tool.id, tool);
}

/** Register several tools at once. */
export function registerTools(tools: FiloTool[]): void {
  for (const tool of tools) registerTool(tool);
}

/** Look up a single tool by id (URL slug). */
export function getTool(id: string): FiloTool | undefined {
  return registry.get(id);
}

/** All registered tools, in registration order. */
export function getTools(): FiloTool[] {
  return Array.from(registry.values());
}

/** Registered tools narrowed to one category. */
export function getToolsByCategory(category: ToolCategory): FiloTool[] {
  return getTools().filter((tool) => tool.category === category);
}