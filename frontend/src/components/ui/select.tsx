import { forwardRef, type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className = "", children, ...props }, ref) => (
  <select
    ref={ref}
    className={`w-full h-10 px-3 text-sm rounded-lg border border-border bg-input text-foreground outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer ${className}`}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
