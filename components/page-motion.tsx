"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

export function PageMotion({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="contents"
    >
      {children}
    </motion.div>
  );
}
