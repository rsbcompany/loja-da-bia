import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyTheme, readStoredTheme, useTheme } from "./use-theme";

const storage = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  clear: () => storage.clear(),
});
const matchMediaMock = vi.fn().mockReturnValue({
  matches: false,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
});
vi.stubGlobal("matchMedia", matchMediaMock);

describe("readStoredTheme", () => {
  beforeEach(() => {
    storage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("defaults to system when nothing is stored", () => {
    expect(readStoredTheme()).toBe("system");
  });
  it("reads a previously stored choice", () => {
    storage.set("bia-theme", "dark");
    expect(readStoredTheme()).toBe("dark");
  });
});

describe("applyTheme", () => {
  it("toggles the dark class on the document", () => {
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    applyTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
  it("follows the system when choice is system", () => {
    matchMediaMock.mockReturnValue({ matches: true, addEventListener: () => undefined, removeEventListener: () => undefined });
    applyTheme("system");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});

describe("useTheme", () => {
  it("persists and applies the chosen theme", () => {
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setTheme("dark"));

    expect(result.current.choice).toBe("dark");
    expect(storage.get("bia-theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
