import { useState, useEffect } from "react";
import { Monitor, Terminal, Skull, Sun } from "lucide-react";

const themes = [
  { id: "dark", name: "Dark", icon: Monitor },
  { id: "kali", name: "Kali Linux", icon: Terminal },
  { id: "ubuntu", name: "Ubuntu", icon: Monitor },
  { id: "hacker", name: "Hacker", icon: Skull },
];

export function ThemeSwitcher() {
  const [current, setCurrent] = useState(() => localStorage.getItem("sh_theme") || "kali");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", current);
    localStorage.setItem("sh_theme", current);
  }, [current]);

  return (
    <div className="grid grid-cols-2 gap-2">
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = current === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setCurrent(t.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              isActive ? "bg-primary/20 text-accent border border-accent/30" : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {t.name}
          </button>
        );
      })}
    </div>
  );
}

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem("sh_theme") || "kali");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("sh_theme", theme);
  }, [theme]);
  return { theme, setTheme };
}
