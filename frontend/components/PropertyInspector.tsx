"use client";

import {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  clampPanelState,
  getDefaultPanelState,
  loadPanelState,
  savePanelState,
  PANEL_MIN_HEIGHT,
  PANEL_MIN_WIDTH,
  PanelState,
  ViewportSize,
} from "@/lib/propertyInspectorState";
import { PredictionResponse } from "@/lib/prediction";

type PropertyInspectorProps = {
  homeTeam: string;
  awayTeam: string;
  prediction: PredictionResponse | null;
};

type BaseInteraction = {
  pointerId: number;
  pointerStart: {
    x: number;
    y: number;
  };
  initial: PanelState;
};

type DragInteraction = BaseInteraction & {
  type: "drag";
};

type ResizeDirection = {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
};

type ResizeInteraction = BaseInteraction & {
  type: "resize";
  direction: ResizeDirection;
};

type Interaction = DragInteraction | ResizeInteraction;

const INITIAL_STATE: PanelState = {
  x: 24,
  y: 24,
  width: 360,
  height: 420,
};

const RESIZE_HANDLES: Array<{
  key: string;
  className: string;
  direction: ResizeDirection;
  cursor: string;
}> = [
  {
    key: "top",
    className: "property-inspector__resize-handle property-inspector__resize-handle--top",
    direction: { top: true },
    cursor: "ns-resize",
  },
  {
    key: "right",
    className: "property-inspector__resize-handle property-inspector__resize-handle--right",
    direction: { right: true },
    cursor: "ew-resize",
  },
  {
    key: "bottom",
    className: "property-inspector__resize-handle property-inspector__resize-handle--bottom",
    direction: { bottom: true },
    cursor: "ns-resize",
  },
  {
    key: "left",
    className: "property-inspector__resize-handle property-inspector__resize-handle--left",
    direction: { left: true },
    cursor: "ew-resize",
  },
  {
    key: "top-left",
    className:
      "property-inspector__resize-handle property-inspector__resize-handle--top-left",
    direction: { top: true, left: true },
    cursor: "nwse-resize",
  },
  {
    key: "top-right",
    className:
      "property-inspector__resize-handle property-inspector__resize-handle--top-right",
    direction: { top: true, right: true },
    cursor: "nesw-resize",
  },
  {
    key: "bottom-right",
    className:
      "property-inspector__resize-handle property-inspector__resize-handle--bottom-right",
    direction: { bottom: true, right: true },
    cursor: "nwse-resize",
  },
  {
    key: "bottom-left",
    className:
      "property-inspector__resize-handle property-inspector__resize-handle--bottom-left",
    direction: { bottom: true, left: true },
    cursor: "nesw-resize",
  },
];

const getViewportSize = (): ViewportSize => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

const stepForKeyboard = (event: ReactKeyboardEvent<HTMLDivElement>) =>
  event.shiftKey ? 24 : 12;

export function PropertyInspector({ homeTeam, awayTeam, prediction }: PropertyInspectorProps) {
  const [panelState, setPanelState] = useState<PanelState>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [interactionMode, setInteractionMode] = useState<"dragging" | "resizing" | null>(null);

  const viewportRef = useRef<ViewportSize>({ width: 0, height: 0 });
  const stateRef = useRef<PanelState>(INITIAL_STATE);
  const interactionRef = useRef<Interaction | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const commitPanelState = useCallback(
    (next: PanelState | ((previous: PanelState) => PanelState)) => {
      setPanelState((current) => {
        const resolved = typeof next === "function" ? (next as (prev: PanelState) => PanelState)(current) : next;
        stateRef.current = resolved;
        return resolved;
      });
    },
    []
  );

  const cleanupInteraction = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    interactionRef.current = null;
    setInteractionMode(null);
    if (typeof document !== "undefined") {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }
  }, []);

  useEffect(() => {
    stateRef.current = panelState;
  }, [panelState]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const viewport = getViewportSize();
    viewportRef.current = viewport;

    const initialState = loadPanelState(viewport);
    commitPanelState(initialState);
    setHydrated(true);

    const handleResize = () => {
      const nextViewport = getViewportSize();
      viewportRef.current = nextViewport;
      commitPanelState((current) => clampPanelState(current, nextViewport));
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [commitPanelState]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    savePanelState(panelState);
  }, [hydrated, panelState]);

  useEffect(() => () => cleanupInteraction(), [cleanupInteraction]);

  const startDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!hydrated) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const pointerId = event.pointerId;
      const target = event.currentTarget;
      try {
        target.setPointerCapture(pointerId);
      } catch (error) {
        console.warn("Unable to capture pointer for drag", error);
      }

      if (typeof document !== "undefined") {
        document.body.style.userSelect = "none";
        document.body.style.cursor = "grabbing";
      }

      const interaction: DragInteraction = {
        type: "drag",
        pointerId,
        pointerStart: { x: event.clientX, y: event.clientY },
        initial: stateRef.current,
      };

      interactionRef.current = interaction;
      setInteractionMode("dragging");

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== pointerId) {
          return;
        }

        moveEvent.preventDefault();

        const deltaX = moveEvent.clientX - interaction.pointerStart.x;
        const deltaY = moveEvent.clientY - interaction.pointerStart.y;

        const viewport = viewportRef.current;
        const nextState = clampPanelState(
          {
            ...interaction.initial,
            x: interaction.initial.x + deltaX,
            y: interaction.initial.y + deltaY,
          },
          viewport
        );

        commitPanelState(nextState);
      };

      const finishInteraction = (finalEvent: PointerEvent) => {
        if (finalEvent.pointerId !== pointerId) {
          return;
        }

        cleanupInteraction();
      };

      const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
        if (keyboardEvent.key !== "Escape") {
          return;
        }

        keyboardEvent.preventDefault();
        const viewport = viewportRef.current;
        commitPanelState(clampPanelState(interaction.initial, viewport));
        cleanupInteraction();
      };

      cleanupRef.current = () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", finishInteraction);
        window.removeEventListener("pointercancel", finishInteraction);
        window.removeEventListener("keydown", handleKeyDown);
        try {
          target.releasePointerCapture(pointerId);
        } catch (error) {
          console.warn("Unable to release pointer capture after drag", error);
        }
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", finishInteraction);
      window.addEventListener("pointercancel", finishInteraction);
      window.addEventListener("keydown", handleKeyDown);
    },
    [cleanupInteraction, commitPanelState, hydrated]
  );

  const startResize = useCallback(
    (
      event: ReactPointerEvent<HTMLDivElement>,
      direction: ResizeDirection,
      cursor: string
    ) => {
      if (!hydrated) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const pointerId = event.pointerId;
      const target = event.currentTarget;
      try {
        target.setPointerCapture(pointerId);
      } catch (error) {
        console.warn("Unable to capture pointer for resize", error);
      }

      if (typeof document !== "undefined") {
        document.body.style.userSelect = "none";
        document.body.style.cursor = cursor;
      }

      const interaction: ResizeInteraction = {
        type: "resize",
        pointerId,
        pointerStart: { x: event.clientX, y: event.clientY },
        initial: stateRef.current,
        direction,
      };

      interactionRef.current = interaction;
      setInteractionMode("resizing");

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== pointerId) {
          return;
        }

        moveEvent.preventDefault();

        const deltaX = moveEvent.clientX - interaction.pointerStart.x;
        const deltaY = moveEvent.clientY - interaction.pointerStart.y;

        const { direction: resizeDirection, initial } = interaction;

        let next: PanelState = initial;

        const viewport = viewportRef.current;

        let x = initial.x;
        let y = initial.y;
        let width = initial.width;
        let height = initial.height;

        if (resizeDirection.left) {
          const anchor = initial.x + initial.width;
          width = initial.width - deltaX;
          x = anchor - width;
        }

        if (resizeDirection.right) {
          width = initial.width + deltaX;
        }

        if (resizeDirection.top) {
          const anchor = initial.y + initial.height;
          height = initial.height - deltaY;
          y = anchor - height;
        }

        if (resizeDirection.bottom) {
          height = initial.height + deltaY;
        }

        next = clampPanelState(
          {
            x,
            y,
            width,
            height,
          },
          viewport
        );

        commitPanelState(next);
      };

      const finishInteraction = (finalEvent: PointerEvent) => {
        if (finalEvent.pointerId !== pointerId) {
          return;
        }

        cleanupInteraction();
      };

      const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
        if (keyboardEvent.key !== "Escape") {
          return;
        }

        keyboardEvent.preventDefault();
        const viewport = viewportRef.current;
        commitPanelState(clampPanelState(interaction.initial, viewport));
        cleanupInteraction();
      };

      cleanupRef.current = () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", finishInteraction);
        window.removeEventListener("pointercancel", finishInteraction);
        window.removeEventListener("keydown", handleKeyDown);
        try {
          target.releasePointerCapture(pointerId);
        } catch (error) {
          console.warn("Unable to release pointer capture after resize", error);
        }
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", finishInteraction);
      window.addEventListener("pointercancel", finishInteraction);
      window.addEventListener("keydown", handleKeyDown);
    },
    [cleanupInteraction, commitPanelState, hydrated]
  );

  const resetPanel = useCallback(() => {
    const viewport = viewportRef.current;
    commitPanelState(getDefaultPanelState(viewport));
  }, [commitPanelState]);

  const handleHeaderKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const viewport = viewportRef.current;

      switch (event.key) {
        case "Escape": {
          event.preventDefault();
          resetPanel();
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          const step = stepForKeyboard(event);
          commitPanelState((current) =>
            clampPanelState(
              {
                ...current,
                y: current.y - step,
              },
              viewport
            )
          );
          break;
        }
        case "ArrowDown": {
          event.preventDefault();
          const step = stepForKeyboard(event);
          commitPanelState((current) =>
            clampPanelState(
              {
                ...current,
                y: current.y + step,
              },
              viewport
            )
          );
          break;
        }
        case "ArrowLeft": {
          event.preventDefault();
          const step = stepForKeyboard(event);
          commitPanelState((current) =>
            clampPanelState(
              {
                ...current,
                x: current.x - step,
              },
              viewport
            )
          );
          break;
        }
        case "ArrowRight": {
          event.preventDefault();
          const step = stepForKeyboard(event);
          commitPanelState((current) =>
            clampPanelState(
              {
                ...current,
                x: current.x + step,
              },
              viewport
            )
          );
          break;
        }
        default:
          break;
      }
    },
    [commitPanelState, resetPanel]
  );

  const inspectorStyle = useMemo(
    () => ({
      width: `${panelState.width}px`,
      height: `${panelState.height}px`,
      transform: `translate3d(${panelState.x}px, ${panelState.y}px, 0)`,
    }),
    [panelState.height, panelState.width, panelState.x, panelState.y]
  );

  if (!hydrated) {
    return null;
  }

  return (
    <aside
      className="property-inspector"
      style={inspectorStyle}
      role="complementary"
      aria-label="Property inspector panel"
    >
      <div
        className={`property-inspector__header${interactionMode === "dragging" ? " property-inspector__header--dragging" : ""}`}
        onPointerDown={startDrag}
        tabIndex={0}
        onKeyDown={handleHeaderKeyDown}
      >
        <div className="property-inspector__title-group">
          <span className="property-inspector__title">Property Inspector</span>
          <span className="property-inspector__subtitle">Layout tools &amp; metadata</span>
        </div>
        <button
          type="button"
          className="property-inspector__reset"
          onClick={resetPanel}
          onPointerDown={(event) => event.stopPropagation()}
        >
          Reset
        </button>
      </div>

      <div className="property-inspector__content" tabIndex={-1}>
        <section className="property-inspector__section">
          <h3>Selection</h3>
          <dl>
            <div>
              <dt>Home Team</dt>
              <dd>{homeTeam}</dd>
            </div>
            <div>
              <dt>Away Team</dt>
              <dd>{awayTeam}</dd>
            </div>
          </dl>
        </section>

        <section className="property-inspector__section">
          <h3>Panel Metrics</h3>
          <dl>
            <div>
              <dt>X / Y</dt>
              <dd>
                {Math.round(panelState.x)}px / {Math.round(panelState.y)}px
              </dd>
            </div>
            <div>
              <dt>Width × Height</dt>
              <dd>
                {Math.round(panelState.width)}px × {Math.round(panelState.height)}px
              </dd>
            </div>
            <div>
              <dt>Limits</dt>
              <dd>
                min {PANEL_MIN_WIDTH}px × {PANEL_MIN_HEIGHT}px
              </dd>
            </div>
          </dl>
        </section>

        <section className="property-inspector__section">
          <h3>Prediction</h3>
          {prediction ? (
            <dl>
              <div>
                <dt>Tip</dt>
                <dd>
                  {prediction.tip} ({Math.round(prediction.confidence * 100)}%)
                </dd>
              </div>
              <div>
                <dt>Probabilities</dt>
                <dd>
                  H {Math.round(prediction.probs.H * 100)}% · D {Math.round(
                    prediction.probs.D * 100
                  )}% · A {Math.round(prediction.probs.A * 100)}%
                </dd>
              </div>
              <div>
                <dt>Pattern Score (H)</dt>
                <dd>{Math.round(prediction["pattern_1_score (H)"] * 100)}%</dd>
              </div>
              <div>
                <dt>Version</dt>
                <dd>{prediction.version}</dd>
              </div>
            </dl>
          ) : (
            <p className="property-inspector__empty">No prediction yet. Submit the form to see insights.</p>
          )}
        </section>
      </div>

      {RESIZE_HANDLES.map((handle) => (
        <div
          key={handle.key}
          className={handle.className}
          aria-hidden="true"
          onPointerDown={(event) => startResize(event, handle.direction, handle.cursor)}
        />
      ))}
    </aside>
  );
}
