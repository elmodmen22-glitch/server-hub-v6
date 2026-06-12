import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
}

import { createContext, useContext } from "react";

interface SheetContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SheetContext = createContext<SheetContextValue | null>(null);

export function SheetTrigger({ children, asChild }: { children: ReactNode; asChild?: boolean }) {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error("SheetTrigger must be used inside Sheet");
  if (asChild) {
    return <div onClick={() => ctx.onOpenChange(!ctx.open)}>{children}</div>;
  }
  return <button onClick={() => ctx.onOpenChange(!ctx.open)}>{children}</button>;
}

export function SheetContent({ children, side = "left", className = "" }: { children: ReactNode; side?: "left" | "right"; className?: string }) {
  const ctx = useContext(SheetContext);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") ctx?.onOpenChange(false); };
    if (ctx?.open) { document.addEventListener("keydown", handler); return () => document.removeEventListener("keydown", handler); }
  }, [ctx]);

  if (!ctx?.open) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 bg-black/60"
      onClick={(e) => { if (e.target === overlayRef.current) ctx.onOpenChange(false); }}>
      <div className={`absolute inset-y-0 ${side === "left" ? "left-0" : "right-0"} w-[260px] flex flex-col ${className}`}
        style={{ background: "var(--sidebar)" }}
        onClick={(e) => e.stopPropagation()}>
        <button onClick={() => ctx.onOpenChange(false)} className="absolute top-3 right-3 text-zinc-500 hover:text-white z-10">
          <X className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
