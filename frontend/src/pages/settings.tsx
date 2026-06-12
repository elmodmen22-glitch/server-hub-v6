import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useLang } from "@/contexts/language";
import { api, authFetch } from "@/lib/api";
import { MessageSquare, Globe, Bell, Save, TestTube2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Settings {
  telegram_bot_token: string;
  telegram_chat_id: string;
  telegram_enabled: boolean;
  language: "en" | "ar";
  notifications: { login: boolean; register: boolean; file_upload: boolean; server_error: boolean };
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { t, lang, setLang } = useLang();
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>({
    telegram_bot_token: "", telegram_chat_id: "", telegram_enabled: false, language: "en",
    notifications: { login: true, register: true, file_upload: true, server_error: true },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try { setSettings(await api.getSettings()); } catch {} finally { setLoading(false); }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.updateSettings({ ...settings, language: lang });
      toast({ title: t("success"), description: t("settings_saved") });
    } catch { toast({ title: t("error"), description: "Failed to save settings", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const testTelegram = async () => {
    setTesting(true);
    try {
      await api.testTelegram();
      toast({ title: t("success"), description: t("test_success") });
    } catch { toast({ title: t("error"), description: t("test_failed"), variant: "destructive" }); }
    finally { setTesting(false); }
  };

  const update = (key: keyof Settings, value: unknown) => setSettings((prev) => ({ ...prev, [key]: value }));
  const updateNotif = (key: keyof Settings["notifications"], value: boolean) => setSettings((prev) => ({ ...prev, notifications: { ...prev.notifications, [key]: value } }));

  if (loading) return <div className="flex items-center justify-center h-full text-zinc-500">{t("loading")}</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold">{t("settings_title")}</h1><p className="text-zinc-400 text-sm mt-1">Configure system preferences</p></div>

      <section className="rounded-2xl border p-5 space-y-4" style={{ background: "#140a24", borderColor: "rgba(139,92,246,0.2)" }}>
        <div className="flex items-center gap-2 font-medium text-white"><Globe className="w-4 h-4 text-accent" />{t("language_settings")}</div>
        <div className="flex gap-3">
          {(["en", "ar"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)}
              className={`flex-1 py-3 rounded-xl border font-medium text-sm transition-all ${lang === l ? "border-accent bg-accent/10 text-accent" : "border-border text-zinc-400 hover:border-[rgba(139,92,246,0.4)] hover:text-white"}`}>
              {l === "en" ? "🇬🇧 English" : "🇸🇦 العربية"}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border p-5 space-y-4" style={{ background: "#140a24", borderColor: "rgba(139,92,246,0.2)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium text-white"><MessageSquare className="w-4 h-4 text-accent" />{t("telegram_settings")}</div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-zinc-400">{t("enable_telegram")}</span>
            <button onClick={() => update("telegram_enabled", !settings.telegram_enabled)}
              className={`relative w-11 h-6 rounded-full transition-colors ${settings.telegram_enabled ? "bg-accent" : "bg-zinc-700"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow ${settings.telegram_enabled ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </label>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">{t("bot_token")}</label>
            <Input value={settings.telegram_bot_token} onChange={(e) => update("telegram_bot_token", e.target.value)}
              placeholder="1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ" className="bg-[#1d1033] border-[rgba(139,92,246,0.3)] text-white font-mono text-sm" />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1.5 block">{t("chat_id")}</label>
            <Input value={settings.telegram_chat_id} onChange={(e) => update("telegram_chat_id", e.target.value)}
              placeholder="-100123456789" className="bg-[#1d1033] border-[rgba(139,92,246,0.3)] text-white font-mono text-sm" />
          </div>
          <Button variant="outline" onClick={testTelegram} disabled={testing || !settings.telegram_bot_token || !settings.telegram_chat_id}
            className="border-[rgba(139,92,246,0.3)] text-zinc-300 hover:text-white gap-2">
            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube2 className="w-4 h-4" />}
            {testing ? t("testing") : t("test_connection")}
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border p-5 space-y-4" style={{ background: "#140a24", borderColor: "rgba(139,92,246,0.2)" }}>
        <div className="flex items-center gap-2 font-medium text-white"><Bell className="w-4 h-4 text-accent" />Notification Events</div>
        <div className="space-y-3">
          {([["login", t("notify_login")], ["register", t("notify_register")], ["file_upload", t("notify_upload")], ["server_error", t("notify_error")]] as const).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">{label}</span>
              <button onClick={() => updateNotif(key, !settings.notifications[key])}
                className={`relative w-11 h-6 rounded-full transition-colors ${settings.notifications[key] ? "bg-accent" : "bg-zinc-700"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow ${settings.notifications[key] ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </label>
          ))}
        </div>
      </section>

      <Button onClick={saveSettings} disabled={saving} className="w-full h-11 font-semibold gap-2" style={{ background: "linear-gradient(135deg,#6d28d9,#a855f7)" }}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? t("loading") : t("save_settings")}
      </Button>
    </div>
  );
}
