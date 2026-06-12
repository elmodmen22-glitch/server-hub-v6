import { createContext, useContext, useState, type ReactNode } from "react";

interface TooltipContextValue {
  show: boolean;
  setShow: (v: boolean) => void;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <TooltipContext.Provider value={{ show, setShow }}>
      <div className="relative inline-block"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}>
        {children}
      </div>
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({ children, asChild }: { children: ReactNode; asChild?: boolean }) {
  return <>{children}</>;
}

export function TooltipContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ctx = useContext(TooltipContext);
  if (!ctx?.show) return null;
  return (
    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg border text-xs whitespace-nowrap z-50 ${className}`}
      style={{ background: "var(--popover)", borderColor: "var(--popover-border)", color: "var(--popover-foreground)" }}>
      {children}
    </div>
  );
}
