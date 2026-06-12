import { createContext, useContext, useState, type ReactNode } from "react";

interface TabsContextValue {
  value: string;
  onValueChange: (v: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({ value, onValueChange, children, className = "" }: { value: string; onValueChange: (v: string) => void; children: ReactNode; className?: string }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`inline-flex rounded-lg overflow-hidden border ${className}`} style={{ borderColor: "var(--border)" }}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className = "" }: { value: string; children: ReactNode; className?: string }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be used inside Tabs");
  const active = ctx.value === value;
  return (
    <button onClick={() => ctx.onValueChange(value)}
      className={`px-4 py-1.5 text-xs font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "text-zinc-400 hover:text-white"} ${className}`}>
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = "" }: { value: string; children: ReactNode; className?: string }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be used inside Tabs");
  if (ctx.value !== value) return null;
  return <div className={className}>{children}</div>;
}
