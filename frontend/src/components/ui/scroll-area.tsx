import { forwardRef, type HTMLAttributes } from "react";

export const ScrollArea = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => (
    <div ref={ref} className={`overflow-auto ${className}`} {...props}>
      {children}
    </div>
  )
);
ScrollArea.displayName = "ScrollArea";
