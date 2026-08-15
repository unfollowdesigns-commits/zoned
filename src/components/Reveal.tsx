"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { EASE } from "@/lib/motion";

/**
 * Scroll reveal. The observer sits on this wrapper, which is never clipped,
 * so it always intersects. The animated child is the inner element.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  const Tag = motion[as];
  return (
    <div className={className}>
      <Tag
        initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0 }}
        transition={{ duration: 0.52, ease: EASE, delay }}
      >
        {children}
      </Tag>
    </div>
  );
}
