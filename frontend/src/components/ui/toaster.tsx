import { useToast } from "@/contexts/toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`notification-enter px-4 py-3 rounded-lg border shadow-lg cursor-pointer text-sm ${
            t.variant === "destructive" ? "bg-red-900 border-red-700 text-white" :
            t.variant === "success" ? "bg-green-900 border-green-700 text-white" :
            "bg-card border-card-border text-card-foreground"
          }`}
        >
          <div className="font-medium">{t.title}</div>
          {t.description && <div className="text-xs opacity-80 mt-1">{t.description}</div>}
        </div>
      ))}
    </div>
  );
}
