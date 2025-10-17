export type PanelState = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ViewportSize = {
  width: number;
  height: number;
};

export const PANEL_STORAGE_KEY = "property-inspector:panel-state";
export const PANEL_MIN_WIDTH = 280;
export const PANEL_MIN_HEIGHT = 220;
export const PANEL_MAX_WIDTH = 620;
export const PANEL_MAX_HEIGHT = 720;
const DEFAULT_WIDTH = 360;
const DEFAULT_HEIGHT = 420;
const DEFAULT_MARGIN = 24;

type PanelStateCandidate = Partial<Record<keyof PanelState, unknown>>;

const clamp = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) {
    return min;
  }

  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
};

const resolveViewport = (viewport: ViewportSize): ViewportSize => ({
  width: Math.max(1, Math.floor(Number.isFinite(viewport.width) ? viewport.width : PANEL_MIN_WIDTH)),
  height: Math.max(1, Math.floor(Number.isFinite(viewport.height) ? viewport.height : PANEL_MIN_HEIGHT)),
});

const clampAxis = (value: number, size: number, viewportSpan: number) => {
  const available = Math.max(0, viewportSpan - size);

  if (available <= DEFAULT_MARGIN) {
    return clamp(value, 0, available);
  }

  const preferredMax = available - DEFAULT_MARGIN;
  const max = preferredMax >= DEFAULT_MARGIN ? preferredMax : available;

  return clamp(value, DEFAULT_MARGIN, Math.max(DEFAULT_MARGIN, max));
};

const isPanelState = (candidate: PanelStateCandidate): candidate is PanelState => {
  return (
    typeof candidate.x === "number" &&
    typeof candidate.y === "number" &&
    typeof candidate.width === "number" &&
    typeof candidate.height === "number"
  );
};

export const clampPanelState = (state: PanelState, viewport: ViewportSize): PanelState => {
  const { width: viewportWidth, height: viewportHeight } = resolveViewport(viewport);

  const minWidth = Math.min(PANEL_MIN_WIDTH, viewportWidth);
  const minHeight = Math.min(PANEL_MIN_HEIGHT, viewportHeight);

  const maxWidth = Math.min(
    PANEL_MAX_WIDTH,
    Math.max(minWidth, viewportWidth - DEFAULT_MARGIN)
  );
  const maxHeight = Math.min(
    PANEL_MAX_HEIGHT,
    Math.max(minHeight, viewportHeight - DEFAULT_MARGIN)
  );

  const width = clamp(state.width, minWidth, maxWidth);
  const height = clamp(state.height, minHeight, maxHeight);

  const x = clampAxis(state.x, width, viewportWidth);
  const y = clampAxis(state.y, height, viewportHeight);

  return { x, y, width, height };
};

export const getDefaultPanelState = (viewport: ViewportSize): PanelState => {
  const resolvedViewport = resolveViewport(viewport);

  const tentativeState: PanelState = {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    x: resolvedViewport.width - DEFAULT_WIDTH - DEFAULT_MARGIN,
    y: DEFAULT_MARGIN,
  };

  return clampPanelState(tentativeState, resolvedViewport);
};

export const loadPanelState = (
  viewport: ViewportSize,
  storage: Pick<Storage, "getItem"> | null = typeof window !== "undefined" ? window.localStorage : null
): PanelState => {
  const fallback = getDefaultPanelState(viewport);

  if (!storage) {
    return fallback;
  }

  try {
    const raw = storage.getItem(PANEL_STORAGE_KEY);

    if (!raw) {
      return fallback;
    }

    const candidate = JSON.parse(raw) as PanelStateCandidate;
    if (!isPanelState(candidate)) {
      return fallback;
    }

    return clampPanelState(candidate, viewport);
  } catch (error) {
    console.warn("Failed to load property inspector panel state", error);
    return fallback;
  }
};

export const savePanelState = (
  state: PanelState,
  storage: Pick<Storage, "setItem"> | null = typeof window !== "undefined" ? window.localStorage : null
) => {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(PANEL_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to persist property inspector panel state", error);
  }
};
