import { describe, expect, it } from "vitest";

import {
  PANEL_MAX_HEIGHT,
  PANEL_MAX_WIDTH,
  PANEL_MIN_HEIGHT,
  PANEL_MIN_WIDTH,
  PANEL_STORAGE_KEY,
  clampPanelState,
  getDefaultPanelState,
  loadPanelState,
  savePanelState,
  type PanelState,
  type ViewportSize,
} from "@/lib/propertyInspectorState";

const viewport: ViewportSize = { width: 1280, height: 720 };

type StorageMock = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  clear: () => void;
};

const createStorage = (): StorageMock => {
  const store = new Map<string, string>();

  return {
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    setItem: (key, value) => {
      store.set(key, value);
    },
    clear: () => store.clear(),
  };
};

describe("clampPanelState", () => {
  it("keeps the panel within viewport boundaries", () => {
    const oversized: PanelState = {
      x: 5000,
      y: -500,
      width: 1600,
      height: 1600,
    };

    const clamped = clampPanelState(oversized, viewport);

    expect(clamped.width).toBeGreaterThanOrEqual(PANEL_MIN_WIDTH);
    expect(clamped.width).toBeLessThanOrEqual(PANEL_MAX_WIDTH);
    expect(clamped.height).toBeGreaterThanOrEqual(PANEL_MIN_HEIGHT);
    expect(clamped.height).toBeLessThanOrEqual(PANEL_MAX_HEIGHT);
    expect(clamped.x).toBeGreaterThanOrEqual(0);
    expect(clamped.y).toBeGreaterThanOrEqual(0);
    expect(clamped.x + clamped.width).toBeLessThanOrEqual(viewport.width);
    expect(clamped.y + clamped.height).toBeLessThanOrEqual(viewport.height);
  });
});

describe("panel state persistence", () => {
  it("persists and restores a valid panel state", () => {
    const storage = createStorage();
    const state: PanelState = {
      x: 160,
      y: 120,
      width: 420,
      height: 360,
    };

    savePanelState(state, storage);
    const restored = loadPanelState(viewport, storage);

    expect(restored).toEqual(state);
  });

  it("clamps restored state when persisted data exceeds constraints", () => {
    const storage = createStorage();

    storage.setItem(
      PANEL_STORAGE_KEY,
      JSON.stringify({ x: 9999, y: 9999, width: 2000, height: 50 })
    );

    const restored = loadPanelState(viewport, storage);

    expect(restored.width).toBeLessThanOrEqual(PANEL_MAX_WIDTH);
    expect(restored.height).toBeGreaterThanOrEqual(PANEL_MIN_HEIGHT);
    expect(restored.x + restored.width).toBeLessThanOrEqual(viewport.width);
    expect(restored.y + restored.height).toBeLessThanOrEqual(viewport.height);
  });

  it("falls back to defaults when stored data is invalid", () => {
    const fallback = getDefaultPanelState(viewport);
    const storage: StorageMock = {
      getItem: () => "not-json",
      setItem: () => {
        /* noop */
      },
      clear: () => {
        /* noop */
      },
    };

    const restored = loadPanelState(viewport, storage);

    expect(restored).toEqual(fallback);
  });
});
