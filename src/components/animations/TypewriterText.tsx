"use client";

import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
}

export function TypewriterText({
  text,
  speed = 30,
  className,
}: TypewriterTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [inView, text, speed]);

  return (
    <span ref={ref} className={className}>
      {displayed}
      {inView && displayed.length < text.length && (
        <span className="inline-block w-0.5 h-[1em] bg-primary animate-pulse ml-0.5 align-middle" />
      )}
    </span>
  );
}
