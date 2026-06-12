import { storage } from "./storage";
import { logger } from "./logger";

export async function sendTelegram(message: string): Promise<boolean> {
  const settings = storage.getSettings();
  if (!settings.telegram_enabled || !settings.telegram_bot_token || !settings.telegram_chat_id) return false;
  try {
    const url = `https://api.telegram.org/bot${settings.telegram_bot_token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: settings.telegram_chat_id, text: `🖥 *SERVER HUB v5*\n\n${message}`, parse_mode: "Markdown" }),
    });
    return res.ok;
  } catch (err) {
    logger.error({ err }, "Telegram send failed");
    return false;
  }
}

export async function notify(type: "login" | "register" | "file_upload" | "server_error" | "tunnel_created" | "session_start", details: string): Promise<void> {
  const settings = storage.getSettings();
  if (!settings.notifications[type]) return;
  const icons: Record<string, string> = {
    login: "🔐", register: "👤", file_upload: "📁", server_error: "🚨", tunnel_created: "🌐", session_start: "💻",
  };
  await sendTelegram(`${icons[type] || "📢"} *${type.toUpperCase().replace(/_/g, " ")}*\n${details}`);
}
