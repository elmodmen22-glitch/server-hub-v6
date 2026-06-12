import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "destructive" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "md", ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none rounded-lg cursor-pointer";
    const variants: Record<string, string> = {
      default: "bg-primary text-primary-foreground hover:opacity-90",
      ghost: "hover:bg-white/10 text-zinc-400 hover:text-white",
      destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
      outline: "border border-border bg-transparent hover:bg-white/5",
    };
    const sizes: Record<string, string> = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "h-9 w-9 p-0",
    };
    return (
      <button ref={ref} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
    );
  }
);
Button.displayName = "Button";
