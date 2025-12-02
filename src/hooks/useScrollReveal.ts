import { useCallback, useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface UseScrollRevealOptions {
  threshold?: number | number[];
  rootMargin?: string;
  once?: boolean;
}

interface UseScrollRevealReturn {
  ref: (node: HTMLElement | null) => void;
  isRevealed: boolean;
  shouldReduceMotion: boolean;
}

export const useScrollReveal = ({
  threshold = 0.2,
  rootMargin = "0px 0px -10% 0px",
  once = true,
}: UseScrollRevealOptions = {}): UseScrollRevealReturn => {
  const shouldReduceMotion = usePrefersReducedMotion();
  const [isRevealed, setIsRevealed] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (shouldReduceMotion) {
      setIsRevealed(true);
      return;
    }

    const node = elementRef.current;

    if (!node || typeof IntersectionObserver === "undefined") {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            if (once) {
              observer.disconnect();
            }
          } else if (!once) {
            setIsRevealed(false);
          }
        });
      },
      { threshold, rootMargin },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [once, rootMargin, shouldReduceMotion, threshold]);

  const assignRef = useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);

  return { ref: assignRef, isRevealed, shouldReduceMotion };
};
