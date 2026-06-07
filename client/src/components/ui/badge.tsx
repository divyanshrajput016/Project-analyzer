import * as React from "react";
import { cn } from "../../lib/utils";

const tones = {
  default: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
  cyan: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200",
  green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  red: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
};

export function Badge({ className, tone = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold", tones[tone], className)} {...props} />;
}

