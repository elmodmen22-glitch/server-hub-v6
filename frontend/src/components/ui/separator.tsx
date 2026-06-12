import { forwardRef, type HTMLAttributes } from "react";

interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className = "", orientation = "horizontal", ...props }, ref) => (
    <div ref={ref} className={`shrink-0 ${orientation === "horizontal" ? "h-px w-full" : "w-px h-full"} ${className}`}
      style={{ background: "var(--border)" }} {...props} />
  )
);
Separator.displayName = "Separator";
