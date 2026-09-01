import { useCallback, useEffect, useMemo, useState } from "react";
import type { FiloToolOption } from "@filo/core";

export type OptionValues = Record<string, unknown>;

/**
 * Holds the live values of a tool's declarative options.
 *
 * Initializes from each {@link FiloToolOption} default, and resets whenever
 * the option definitions change (i.e. when switching tools).
 */
export function useToolOptions(options?: readonly FiloToolOption[]) {
  const defaults = useMemo<OptionValues>(() => {
    const values: OptionValues = {};
    for (const def of options ?? []) {
      values[def.key] = def.default;
    }
    return values;
  }, [options]);

  const [values, setValues] = useState<OptionValues>(defaults);

  useEffect(() => {
    setValues(defaults);
  }, [defaults]);

  const setValue = useCallback((key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  return { values, setValue };
}