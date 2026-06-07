import * as React from "react";
import { cn } from "../../lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn("h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 dark:border-zinc-800 dark:bg-zinc-950", className)}
      {...props}
    />
  );
});

Input.displayName = "Input";

