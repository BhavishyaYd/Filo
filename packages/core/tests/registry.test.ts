import { describe, it, expect } from "vitest";
import type { FiloTool } from "../src/types";
import { registerTool, registerTools, getTool, getTools, getToolsByCategory } from "../src/registry";

function makeTool(id: string, category: FiloTool["category"]): FiloTool {
  return {
    id,
    category,
    label: id,
    description: "test tool",
    acceptedFileTypes: [],
    runsClientSide: true,
    run: () => Promise.resolve(new File([], `${id}.txt`)),
  };
}

describe("registry", () => {
  it("registers a tool and returns it by id", () => {
    const tool = makeTool("pdf-merge", "pdf");
    registerTool(tool);
    expect(getTool("pdf-merge")).toBe(tool);
  });

  it("throws on duplicate ids instead of silently overriding", () => {
    registerTool(makeTool("dup", "image"));
    expect(() => registerTool(makeTool("dup", "image"))).toThrow(/already registered/);
  });

  it("registers several tools and lists all of them", () => {
    registerTools([
      makeTool("image-compress", "image"),
      makeTool("json-formatter", "dev"),
    ]);
    const ids = getTools().map((t) => t.id);
    expect(ids).toContain("image-compress");
    expect(ids).toContain("json-formatter");
  });

  it("filters tools by category", () => {
    const dev = getToolsByCategory("dev");
    expect(dev.map((t) => t.id)).toEqual(["json-formatter"]);
  });
});