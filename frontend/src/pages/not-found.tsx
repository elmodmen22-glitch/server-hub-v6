import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-full w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border p-6 md:p-8 text-center space-y-4 animate-fadeIn"
        style={{ background: "#140a24", borderColor: "rgba(139,92,246,0.2)" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">404</h1>
          <p className="text-zinc-400 text-sm">Page Not Found</p>
        </div>
        <p className="text-sm text-zinc-600">Did you forget to add the page to the router?</p>
        <Button onClick={() => window.location.hash = "#/"}
          className="mx-auto mt-2 gap-2 bg-primary hover:bg-primary/90 text-white" size="sm">
          <Home className="w-4 h-4" /> Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
