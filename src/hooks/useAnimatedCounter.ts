import { useCallback, useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface UseAnimatedCounterOptions {
  targetNumber: number;
  duration?: number;
  startDelay?: number;
  once?: boolean;
}

interface UseAnimatedCounterReturn {
  ref: (node: HTMLElement | null) => void;
  value: number;
  hasAnimated: boolean;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const useAnimatedCounter = ({
  targetNumber,
  duration = 1800,
  startDelay = 0,
  once = true,
}: UseAnimatedCounterOptions): UseAnimatedCounterReturn => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(() => (prefersReducedMotion ? targetNumber : 0));
  const [hasAnimated, setHasAnimated] = useState(false);
  const nodeRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<number>();
  const timeoutRef = useRef<number>();
  const hasStartedRef = useRef(false);

  const cleanupAnimationFrame = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = undefined;
    }
  };

  useEffect(() => {
    if (prefersReducedMotion) {
      cleanupAnimationFrame();
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
      setValue(targetNumber);
      setHasAnimated(true);
      return;
    }

    const node = nodeRef.current;
    if (!node) {
      return;
    }

    const startAnimation = () => {
      if (hasStartedRef.current && once) {
        return;
      }

      hasStartedRef.current = true;
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const nextValue = Math.floor(eased * targetNumber);
        setValue(nextValue);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(tick);
        } else {
          setValue(targetNumber);
          setHasAnimated(true);
          cleanupAnimationFrame();
        }
      };

      cleanupAnimationFrame();
      frameRef.current = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (startDelay > 0) {
              timeoutRef.current = window.setTimeout(startAnimation, startDelay);
            } else {
              startAnimation();
            }

            if (once) {
              observer.disconnect();
            }
          } else if (!once && !prefersReducedMotion) {
            hasStartedRef.current = false;
            setHasAnimated(false);
            setValue(0);
          }
        });
      },
      { threshold: 0.4 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      cleanupAnimationFrame();
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
    };
  }, [duration, once, prefersReducedMotion, startDelay, targetNumber]);

  useEffect(() => {
    if (!once) {
      hasStartedRef.current = false;
      setHasAnimated(false);
    }
  }, [targetNumber, once]);

  const assignRef = useCallback((node: HTMLElement | null) => {
    nodeRef.current = node;
  }, []);

  return { ref: assignRef, value, hasAnimated };
};
