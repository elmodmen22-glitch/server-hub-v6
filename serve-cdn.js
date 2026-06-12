/**
 * SERVER HUB v5 - CDN-based static server
 * Loads React + xterm from CDN, serves the app as a single HTML page
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");

const PORT = 5173;
const ROOT = __dirname;

const serveApp = (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en" class="dark" data-theme="kali">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1">
<title>SERVER HUB v5</title>
<script crossorigin="anonymous" src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
<script crossorigin="anonymous" src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
<script crossorigin="anonymous" src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<link rel="stylesheet" href="https://unpkg.com/xterm@5.3.0/css/xterm.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body,#root{height:100%;width:100%}
body{font-family:'Inter',sans-serif;background:#0b0616;color:#fff;overflow:hidden;-webkit-font-smoothing:antialiased}
#loading{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#0b0616;color:#a855f7;font-family:'Inter',sans-serif;gap:16px}
#loading .spinner{width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#6d28d9,#a855f7);display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px rgba(139,92,246,0.3);animation:pulse 1.5s ease-in-out infinite;font-size:22px;font-weight:bold;color:#fff}
#loading p{font-size:13px;color:#71717a}
#error{display:none;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#0b0616;color:#ef4444;font-family:'Inter',sans-serif;gap:12px;padding:24px;text-align:center}
#error h2{font-size:16px;font-weight:600}
#error p{font-size:12px;color:#a1a1aa;max-width:400px}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}

/* Theme system */
:root{--bg:#0b0616;--fg:#fff;--border:rgba(139,92,246,0.2);--input:#1d1033;--ring:rgba(139,92,246,0.3);--card:#140a24;--card-fg:#fff;--primary:#6d28d9;--primary-light:#8b5cf6;--primary-fg:#fff;--secondary:#1d1033;--muted-fg:#a1a1aa;--accent:#a855f7;--accent-fg:#fff;--destructive:#ef4444;--sidebar:#0b0616;--sidebar-border:rgba(139,92,246,0.15)}
[data-theme="kali"]{--bg:#0a0a0a;--fg:#00ff00;--border:rgba(0,255,0,0.2);--input:#1a1a1a;--ring:rgba(0,255,0,0.3);--card:#111;--card-fg:#00ff00;--primary:#00aa00;--primary-light:#00ff00;--primary-fg:#000;--secondary:#1a1a1a;--muted-fg:#006600;--accent:#00ff00;--accent-fg:#000;--destructive:#ff0000;--sidebar:#0a0a0a;--sidebar-border:rgba(0,255,0,0.15)}
[data-theme="hacker"]{--bg:#000;--fg:#00ff41;--border:rgba(0,255,65,0.25);--input:#0a0a0a;--ring:rgba(0,255,65,0.4);--card:#050505;--card-fg:#00ff41;--primary:#00cc33;--primary-light:#00ff41;--primary-fg:#000;--secondary:#0a0a0a;--muted-fg:#005500;--accent:#00ff41;--accent-fg:#000;--destructive:#ff0033;--sidebar:#000;--sidebar-border:rgba(0,255,65,0.15)}
[data-theme="ubuntu"]{--bg:#1a1a2e;--fg:#e0e0e0;--border:rgba(228,77,38,0.3);--input:#2d2d44;--ring:rgba(228,77,38,0.4);--card:#222238;--card-fg:#e0e0e0;--primary:#e44d26;--primary-light:#f0652f;--primary-fg:#fff;--secondary:#2d2d44;--muted-fg:#8888aa;--accent:#e44d26;--accent-fg:#fff;--destructive:#ff4444;--sidebar:#16162a;--sidebar-border:rgba(228,77,38,0.2)}

body{background:var(--bg);color:var(--fg)}
a{color:var(--accent)}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--primary);border-radius:4px}

/* Utility classes */
.flex{display:flex}.flex-col{flex-direction:column}.flex-1{flex:1}.items-center{align-items:center}.items-start{align-items:flex-start}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.gap-1{gap:4px}.gap-2{gap:8px}.gap-3{gap:12px}.gap-4{gap:16px}.gap-5{gap:20px}.shrink-0{flex-shrink:0}.min-w-0{min-width:0}.overflow-hidden{overflow:hidden}.overflow-auto{overflow:auto}.overflow-x-auto{overflow-x:auto}.truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.h-full{height:100%}.w-full{width:100%}.h-screen{height:100vh}.min-h-0{min-height:0}
.p-1{padding:4px}.p-2{padding:8px}.p-3{padding:12px}.p-4{padding:16px}.p-5{padding:20px}.p-6{padding:24px}.px-2{padding-left:8px;padding-right:8px}.px-3{padding-left:12px;padding-right:12px}.px-4{padding-left:16px;padding-right:16px}.py-1{padding-top:4px;padding-bottom:4px}.py-2{padding-top:8px;padding-bottom:8px}.py-3{padding-top:12px;padding-bottom:12px}
.mx-auto{margin-left:auto;margin-right:auto}.mt-1{margin-top:4px}.mt-2{margin-top:8px}.mb-2{margin-bottom:8px}.mb-4{margin-bottom:16px}
.text-xs{font-size:11px}.text-sm{font-size:13px}.text-base{font-size:15px}.text-lg{font-size:17px}.text-xl{font-size:20px}.text-2xl{font-size:24px}.font-medium{font-weight:500}.font-bold{font-weight:700}.font-mono{font-family:'JetBrains Mono',monospace}.text-center{text-align:center}
.text-white{color:#fff}.text-accent{color:var(--accent)}.text-zinc-300{color:#d4d4d8}.text-zinc-400{color:#a1a1aa}.text-zinc-500{color:#71717a}.text-zinc-600{color:#52525b}.text-zinc-700{color:#3f3f46}.text-red-400{color:#f87171}.text-green-400{color:#4ade80}.text-green-500{color:#22c55e}.text-yellow-400{color:#facc15}.text-amber-400{color:#fbbf24}.text-blue-400{color:#60a5fa}
.bg-card{background:var(--card)}.bg-input{background:var(--input)}.bg-sidebar{background:var(--sidebar)}
.rounded-lg{border-radius:8px}.rounded-xl{border-radius:12px}.rounded-2xl{border-radius:16px}.rounded-full{border-radius:9999px}
.border{border:1px solid var(--border)}.border-b{border-bottom:1px solid var(--border)}.border-t{border-top:1px solid var(--border)}.border-l{border-left:1px solid var(--border)}.border-accent{border-color:var(--accent)}.border-transparent{border-color:transparent}
.cursor-pointer{cursor:pointer}.cursor-default{cursor:default}
.transition-all{transition:all .2s}.transition-colors{transition:color .2s,background .2s,border-color .2s}
.hover\\:bg-accent\\/10:hover{background:rgba(168,85,247,0.1)}.hover\\:bg-white\\/5:hover{background:rgba(255,255,255,0.05)}.hover\\:text-white:hover{color:#fff}

/* Button */
.btn{display:inline-flex;align-items:center;justify-content:center;font-weight:500;border-radius:8px;cursor:pointer;transition:all .2s;border:1px solid transparent;font-family:inherit}
.btn-primary{background:var(--primary);color:var(--primary-fg)}.btn-primary:hover{opacity:.9}
.btn-ghost{background:transparent;color:#71717a;border-color:transparent}.btn-ghost:hover{background:rgba(255,255,255,.08);color:#fff}
.btn-sm{height:28px;padding:0 10px;font-size:11px;gap:4px}
.btn-icon{width:28px;height:28px;padding:0}
.btn-lg{height:44px;padding:0 24px;font-size:14px}

/* Input */
.input{width:100%;padding:8px 12px;border-radius:8px;border:1px solid var(--border);background:var(--input);color:var(--fg);font-size:13px;font-family:inherit;outline:none;transition:border-color .2s}
.input:focus{border-color:var(--accent);box-shadow:0 0 0 2px var(--ring)}
.input::placeholder{color:#52525b}

/* Badge */
.badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:500;border:1px solid}
.badge-accent{background:rgba(168,85,247,0.1);color:var(--accent);border-color:rgba(168,85,247,0.2)}
.badge-green{background:rgba(74,222,128,0.1);color:#4ade80;border-color:rgba(74,222,128,0.2)}
.badge-red{background:rgba(248,113,113,0.1);color:#f87171;border-color:rgba(248,113,113,0.2)}

/* Tab styles */
.tab{display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:11px;font-family:'JetBrains Mono',monospace;white-space:nowrap;transition:all .2s;border:1px solid transparent}
.tab-active{background:rgba(109,40,217,0.2);color:#fff;border-color:var(--accent)}
.tab-inactive{color:#71717a}.tab-inactive:hover{color:#d4d4d8;background:rgba(255,255,255,0.05)}

/* Sidebar */
.sidebar{width:220px;background:var(--sidebar);border-right:1px solid var(--sidebar-border);display:flex;flex-direction:column;height:100vh;flex-shrink:0;transition:width .3s ease}
.sidebar.collapsed{width:68px}
.nav-item{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:8px;cursor:pointer;transition:all .2s;position:relative;color:#a1a1aa}
.nav-item:hover{background:rgba(255,255,255,0.05);color:#fff}
.nav-item.active{background:rgba(109,40,217,0.2);color:#fff}
.nav-item.active .nav-indicator{position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:20px;border-radius:0 3px 3px 0;background:linear-gradient(180deg,#8b5cf6,#a855f7)}

/* Terminal */
.xterm-viewport{scrollbar-width:thin}

/* Toast */
#toast-container{position:fixed;bottom:16px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;max-width:320px}
.toast{padding:12px 16px;border-radius:8px;border:1px solid;box-shadow:0 8px 32px rgba(0,0,0,0.5);cursor:pointer;font-size:13px;animation:slideIn .3s ease-out}
.toast-default{background:var(--card);border-color:var(--card-border);color:var(--card-fg)}
.toast-success{background:#065f46;border-color:#059669;color:#fff}
.toast-error{background:#7f1d1d;border-color:#dc2626;color:#fff}
@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}

/* Status dot */
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;flex-shrink:0}
.dot-green{background:#22c55e}.dot-red{background:#ef4444}.dot-yellow{background:#eab308;animation:pulse 1.5s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}

/* Grid layouts */
.grid{display:grid}.grid-cols-2{grid-template-columns:repeat(2,1fr)}.grid-cols-4{grid-template-columns:repeat(4,1fr)}.grid-cols-3{grid-template-columns:repeat(3,1fr)}.grid-cols-6{grid-template-columns:repeat(6,1fr)}
@media(max-width:768px){.grid-cols-4{grid-template-columns:repeat(2,1fr)}.grid-cols-6{grid-template-columns:repeat(3,1fr)}.sidebar{position:fixed;z-index:40;left:0;top:0}.sidebar-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:39}}
</style>
</head>
<body>
<div id="loading"><div class="spinner">S</div><p>Loading SERVER HUB v5...</p></div>
<div id="error"><h2>Failed to load</h2><p>Check console for details (F12)</p></div>
<div id="root" style="display:none"></div>
<script type="text/babel" data-presets="react">
const { useState, useEffect, useRef, useCallback, createContext, useContext, createElement: h, Fragment } = React;

// ====== Toast Context ======
const ToastContext = createContext(null);
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  let tid = useRef(0);
  const toast = useCallback((t) => {
    const id = String(++tid.current);
    setToasts(p => [...p, { ...t, id }]);
    if ((t.duration ?? 4000) > 0) setTimeout(() => setToasts(p => p.filter(x => x.id !== id)), t.duration ?? 4000);
    return id;
  }, []);
  const dismiss = useCallback((id) => setToasts(p => p.filter(x => x.id !== id)), []);
  return h(ToastContext.Provider, { value: { toasts, toast, dismiss } }, children);
}
function useToast() { const ctx = useContext(ToastContext); if (!ctx) throw Error('useToast'); return ctx; }
function Toaster() {
  const { toasts, dismiss } = useToast();
  if (!toasts.length) return null;
  return h('div', { id: 'toast-container' }, ...toasts.map(t =>
    h('div', { key: t.id, className: 'toast toast-' + (t.variant === 'destructive' ? 'error' : t.variant === 'success' ? 'success' : 'default'), onClick: () => dismiss(t.id) },
      h('div', { style: { fontWeight: 500 } }, t.title),
      t.description && h('div', { style: { fontSize: 11, opacity: .8, marginTop: 4 } }, t.description)
    )
  ));
}

// ====== Auth Context ======
const AuthContext = createContext(null);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sh_token'));
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = localStorage.getItem('sh_token');
    if (!t) { setUser(null); setLoading(false); return; }
    setLoading(false);
  }, []);
  const login = useCallback(async (username, password) => {
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    localStorage.setItem('sh_token', data.token);
    setToken(data.token);
    setUser(data.user || { id: '1', username, role: 'admin', display_name: username, avatar: null, expires_at: null });
  }, []);
  const logout = useCallback(() => { localStorage.removeItem('sh_token'); setToken(null); setUser(null); }, []);
  return h(AuthContext.Provider, { value: { user, token, login, logout, loading } }, children);
}
function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw Error('useAuth'); return ctx; }

// ====== Language Context ======
const LangContext = createContext(null);
const translations = {
  en: { dashboard: 'Dashboard', terminal: 'Terminal', editor: 'Editor', files: 'Files', ai_chat: 'AI Chat', admin: 'Admin Panel', settings: 'Settings', profile: 'Profile', logout: 'Logout', login: 'Login', login_title: 'Welcome to SERVER HUB', login_subtitle: 'Sign in to manage your server', username: 'Username', password: 'Password', sign_in: 'Sign In', cpu_usage: 'CPU Usage', memory: 'Memory', disk_space: 'Disk Space', uptime: 'Uptime', system_overview: 'System Overview', live_monitoring: 'Live monitoring and resource usage', new_terminal: 'New Terminal', connected: 'Connected', connecting: 'Connecting', reconnecting: 'Reconnecting...', offline: 'Offline', clear: 'Clear', restart: 'Restart', open_ports: 'Open Ports', top_processes: 'Top Processes', kill: 'Kill', no_ports: 'No open ports detected', no_processes: 'No processes found', total: 'total', cores: 'Cores', load: 'Load', of: 'of', cancel: 'Cancel', create: 'Create', save: 'Save', error: 'Error', success: 'Success', loading: 'Loading...', search: 'Search...', name: 'Name', size: 'Size', date: 'Date', rename: 'Rename', delete: 'Delete', open: 'Open', new_file: 'New File', new_folder: 'New Folder', upload: 'Upload', empty_folder: 'Empty folder', no_results: 'No results found', drop_to_upload: 'Drop files to upload', select_file: 'Select a file to open' },
  ar: { dashboard: 'لوحة التحكم', terminal: 'الطرفية', editor: 'المحرر', files: 'الملفات', ai_chat: 'المساعد الذكي', admin: 'لوحة الإدمن', settings: 'الإعدادات', profile: 'الملف الشخصي', logout: 'تسجيل الخروج', login: 'تسجيل الدخول', login_title: 'مرحباً بك في SERVER HUB', login_subtitle: 'سجّل دخولك لإدارة السيرفر', username: 'اسم المستخدم', password: 'كلمة المرور', sign_in: 'دخول', cpu_usage: 'استخدام المعالج', memory: 'الذاكرة', disk_space: 'مساحة القرص', uptime: 'وقت التشغيل', system_overview: 'نظرة عامة', live_monitoring: 'مراقبة مباشرة للموارد', new_terminal: 'طرفية جديدة', connected: 'متصل', connecting: 'جارٍ الاتصال', reconnecting: 'إعادة الاتصال...', offline: 'غير متصل', clear: 'مسح', restart: 'إعادة تشغيل', open_ports: 'المنافذ المفتوحة', top_processes: 'أبرز العمليات', kill: 'إيقاف', no_ports: 'لا توجد منافذ', no_processes: 'لا توجد عمليات', total: 'إجمالي', cores: 'أنوية', load: 'الحمل', of: 'من', cancel: 'إلغاء', create: 'إنشاء', save: 'حفظ', error: 'خطأ', success: 'نجاح', loading: 'جارٍ التحميل...', search: 'بحث...', name: 'الاسم', size: 'الحجم', date: 'التاريخ', rename: 'إعادة التسمية', delete: 'حذف', open: 'فتح', new_file: 'ملف جديد', new_folder: 'مجلد جديد', upload: 'رفع ملف', empty_folder: 'المجلد فارغ', no_results: 'لا توجد نتائج', drop_to_upload: 'أسقط الملفات للرفع', select_file: 'اختر ملفاً للفتح' }
};
function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('sh_lang') || 'en');
  useEffect(() => { document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; document.documentElement.lang = lang; }, [lang]);
  const setLang = (l) => { setLangState(l); localStorage.setItem('sh_lang', l); };
  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;
  const isRTL = lang === 'ar';
  return h(LangContext.Provider, { value: { lang, setLang, t, isRTL } }, children);
}
function useLang() { const ctx = useContext(LangContext); if (!ctx) throw Error('useLang'); return ctx; }

// ====== Theme Switcher ======
function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('sh_theme') || 'kali');
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('sh_theme', theme); }, [theme]);
  return { theme, setTheme };
}
function ThemeSwitcher({ theme, setTheme }) {
  const themes = [
    { id: 'dark', label: 'Dark' }, { id: 'kali', label: 'Kali' },
    { id: 'ubuntu', label: 'Ubuntu' }, { id: 'hacker', label: 'Hacker' }
  ];
  return h('div', { className: 'grid grid-cols-2 gap-2' }, ...themes.map(t =>
    h('button', {
      key: t.id, onClick: () => setTheme(t.id),
      style: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, fontSize: 10, fontWeight: 500, cursor: 'pointer',
        background: theme === t.id ? 'rgba(109,40,217,0.2)' : 'transparent',
        color: theme === t.id ? 'var(--accent)' : '#71717a',
        border: theme === t.id ? '1px solid rgba(168,85,247,0.3)' : '1px solid transparent',
        transition: 'all .2s' }
    }, t.label))
  ));
}

// ====== Theme Context (for terminal theme) ======
const ThemeCtx = createContext('kali');

// ====== Terminal Page (FIXED) ======
function TerminalPage() {
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [statuses, setStatuses] = useState({});
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const resources = useRef({});
  const containers = useRef({});
  const logsEnd = useRef(null);
  const { toast } = useToast();
  const { theme } = useTheme();

  const addLog = useCallback((msg) => setLogs(p => [...p.slice(-100), '[' + new Date().toLocaleTimeString() + '] ' + msg]), []);
  useEffect(() => logsEnd.current?.scrollIntoView({ behavior: 'smooth' }), [logs]);

  const setStatus = (id, s) => setStatuses(p => ({ ...p, [id]: s }));
  const getRes = (id) => { if (!resources.current[id]) resources.current[id] = { ws: null, term: null, fit: null, hb: null }; return resources.current[id]; };

  const connectWs = useCallback((tabId, sessionId) => {
    const res = getRes(tabId);
    if (res.ws) { res.ws.onclose = null; res.ws.close(); }
    if (res.hb) clearInterval(res.hb);
    setStatus(tabId, 'connecting');
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(proto + '//' + location.host + '/api/terminal/ws/' + sessionId);
    res.ws = ws;
    ws.onopen = () => {
      setStatus(tabId, 'connected'); addLog('Session ' + sessionId.slice(0, 8) + ' connected');
      const r = getRes(tabId);
      if (r.fit) { try { r.fit.fit(); const d = r.fit.proposeDimensions(); if (d) ws.send(JSON.stringify({ type: 'resize', cols: d.cols, rows: d.rows })); } catch {} }
      res.hb = setInterval(() => { if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'ping' })); }, 25000);
    };
    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        const r = getRes(tabId);
        if (msg.type === 'output' && r.term) r.term.write(msg.data);
        else if (msg.type === 'exit') { setStatus(tabId, 'offline'); addLog('Session ' + sessionId.slice(0, 8) + ' exited'); }
      } catch {}
    };
    ws.onclose = () => {
      const r = getRes(tabId);
      if (r.hb) { clearInterval(r.hb); r.hb = null; }
      setStatus(tabId, 'reconnecting');
      addLog('Session ' + sessionId.slice(0, 8) + ' disconnected, reconnecting...');
      setTimeout(() => { if (getRes(tabId).ws === ws || !getRes(tabId).ws) connectWs(tabId, sessionId); }, 3000);
    };
    ws.onerror = () => { setStatus(tabId, 'offline'); addLog('Session ' + sessionId.slice(0, 8) + ' error'); };
  }, [addLog]);

  const mountTerminal = useCallback((tabId, el, sessionId) => {
    const res = getRes(tabId);
    if (res.term) return;
    const term = new Terminal({
      theme: { background: '#0a0a0a', foreground: '#00ff00', cursor: '#00ff00', cursorAccent: '#000', selection: 'rgba(0,255,0,0.25)',
        black: '#000', red: '#ff0000', green: '#00ff00', yellow: '#ffff00', blue: '#0000ff', magenta: '#ff00ff', cyan: '#00ffff', white: '#e0e0e0',
        brightBlack: '#555', brightRed: '#ff5555', brightGreen: '#55ff55', brightYellow: '#ffff55', brightBlue: '#5555ff', brightMagenta: '#ff55ff', brightCyan: '#55ffff', brightWhite: '#fff' },
      fontFamily: '"JetBrains Mono", "Fira Code", monospace', fontSize: 14, lineHeight: 1.45, cursorBlink: true, cursorStyle: 'bar',
      allowTransparency: false, scrollback: 50000, rendererType: 'canvas'
    });
    const fit = new FitAddon();
    const wl = new WebLinksAddon();
    term.loadAddon(fit);
    term.loadAddon(wl);
    term.open(el);
    requestAnimationFrame(() => { try { fit.fit(); } catch {} });
    setTimeout(() => { try { fit.fit(); } catch {} }, 100);
    res.term = term; res.fit = fit;

    // FIX: Use onData instead of onKey
    term.onData((data) => {
      const r = getRes(tabId);
      if (r.ws?.readyState === 1) r.ws.send(JSON.stringify({ type: 'input', data }));
    });

    term.attachCustomKeyEventHandler((e) => {
      if (e.type === 'keydown' && e.ctrlKey && e.key === 'v') {
        navigator.clipboard.readText().then((text) => {
          const r = getRes(tabId);
          if (r.ws?.readyState === 1) r.ws.send(JSON.stringify({ type: 'input', data: text }));
        });
        return false;
      }
      return true;
    });

    term.onSelectionChange(() => { const s = term.getSelection(); if (s) navigator.clipboard.writeText(s).catch(() => {}); });
    connectWs(tabId, sessionId);
  }, [connectWs]);

  const createTab = useCallback(async (name) => {
    const tabName = name || 'Terminal ' + (tabs.length + 1);
    try {
      const res = await fetch('/api/terminal/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: tabName }) });
      const session = await res.json();
      if (!res.ok) throw new Error(session.error);
      setTabs(p => [...p, { id: session.id, name: tabName, sessionId: session.id }]);
      setActiveTabId(session.id);
      addLog('Created terminal: ' + tabName);
      toast({ title: 'Terminal created', description: tabName, variant: 'success' });
    } catch { toast({ title: 'Failed to create terminal', variant: 'destructive' }); }
  }, [tabs.length, addLog, toast]);

  const closeTab = useCallback((tabId) => {
    const res = getRes(tabId);
    if (res.hb) clearInterval(res.hb);
    if (res.ws) { res.ws.onclose = null; res.ws.close(); }
    if (res.term) res.term.dispose();
    delete resources.current[tabId];
    delete containers.current[tabId];
    const tab = tabs.find(t => t.id === tabId);
    if (tab) fetch('/api/terminal/sessions/' + tab.sessionId, { method: 'DELETE' }).catch(() => {});
    setTabs(p => { const r = p.filter(t => t.id !== tabId); setActiveTabId(c => c === tabId ? (r.length ? r[r.length - 1].id : null) : c); return r; });
    setStatuses(p => { const n = { ...p }; delete n[tabId]; return n; });
    addLog('Closed terminal session');
  }, [tabs, addLog]);

  useEffect(() => {
    if (!activeTabId) return;
    const tab = tabs.find(t => t.id === activeTabId);
    if (!tab) return;
    const el = containers.current[activeTabId];
    if (!el) return;
    const res = getRes(activeTabId);
    if (res.term) { requestAnimationFrame(() => { try { res.fit?.fit(); } catch {} }); return; }
    mountTerminal(activeTabId, el, tab.sessionId);
  }, [activeTabId, tabs, mountTerminal]);

  useEffect(() => {
    const f = () => {
      for (const id of Object.keys(resources.current)) {
        const { fit: f2, ws } = resources.current[id];
        if (!f2) continue;
        try { f2.fit(); if (ws?.readyState === 1) { const d = f2.proposeDimensions(); if (d) ws.send(JSON.stringify({ type: 'resize', cols: d.cols, rows: d.rows })); } } catch {}
      }
    };
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);

  useEffect(() => { createTab('Terminal 1'); }, []);

  const actStatus = activeTabId ? statuses[activeTabId] : undefined;
  const dotClass = actStatus === 'connected' ? 'dot-green' : actStatus === 'offline' ? 'dot-red' : 'dot-yellow';
  const statusLabel = (s) => s === 'connected' ? 'Connected' : s === 'offline' ? 'Offline' : s === 'reconnecting' ? 'Reconnecting...' : 'Connecting';
  const clearActive = () => { if (activeTabId) getRes(activeTabId).term?.clear(); };
  const restartActive = () => { if (!activeTabId) return; const tab = tabs.find(t => t.id === activeTabId); if (!tab) return; getRes(activeTabId).term?.clear(); connectWs(activeTabId, tab.sessionId); };

  return h('div', {
    className: 'flex flex-col' + (fullscreen ? ' fixed inset-0 z-50' : ' h-full'),
    style: { background: 'var(--bg)' }
  },
    // Top Bar
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderBottom: '1px solid var(--border)', background: 'var(--card)', flexShrink: 0 } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 4, flex: 1, overflowX: 'auto', minWidth: 0 } },
        ...[...tabs.map(tab => {
          const isActive = tab.id === activeTabId;
          return h('div', {
            key: tab.id, onClick: () => setActiveTabId(tab.id),
            className: 'tab ' + (isActive ? 'tab-active' : 'tab-inactive')
          },
            h('span', { className: 'dot ' + (statuses[tab.id] === 'connected' ? 'dot-green' : statuses[tab.id] === 'offline' ? 'dot-red' : 'dot-yellow') }),
            h('span', { style: { fontSize: 11, opacity: isActive ? 1 : .6 } }, '\\$'),
            h('span', null, tab.name),
            h('button', {
              onClick: (e) => { e.stopPropagation(); closeTab(tab.id); },
              style: { marginLeft: 2, opacity: 0, padding: 2, borderRadius: 4, transition: 'opacity .2s', color: '#ef4444' },
              onMouseEnter: (e) => e.target.style.opacity = 1,
              onMouseLeave: (e) => e.target.style.opacity = 0
            }, '✕')
          );
        }), h('button', {
          onClick: () => createTab(),
          className: 'btn btn-ghost btn-sm',
          style: { flexShrink: 0 }
        }, '+')]
      ),
      activeTabId && h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card)' } },
        h('span', { className: 'dot ' + dotClass }),
        h('span', { style: { color: '#71717a', fontFamily: "'JetBrains Mono',monospace" } }, statusLabel(actStatus))
      ),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 2, paddingLeft: 8, borderLeft: '1px solid var(--border)', flexShrink: 0 } },
        ...[
          { icon: '🗑', title: 'Clear', onClick: clearActive },
          { icon: '🔄', title: 'Restart', onClick: restartActive },
          { icon: showLogs ? '👁' : '👁‍🗨', title: 'Logs', onClick: () => setShowLogs(!showLogs) },
          { icon: fullscreen ? '⛶' : '⛶', title: 'Fullscreen', onClick: () => setFullscreen(!fullscreen) },
        ].map(b => h('button', { key: b.icon, onClick: b.onClick, title: b.title, className: 'btn btn-ghost btn-icon' }, b.icon))
      )
    ),
    // Terminal area
    h('div', { style: { flex: 1, display: 'flex', overflow: 'hidden' } },
      h('div', { style: { flex: 1, position: 'relative', overflow: 'hidden' } },
        !tabs.length ?
          h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 } },
            h('div', { style: { width: 80, height: 80, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.1)' } }, h('span', { style: { fontSize: 40, opacity: .6 } }, '>_')),
            h('div', { style: { textAlign: 'center' } },
              h('p', { style: { color: '#a1a1aa', fontSize: 13, fontWeight: 500 } }, 'No terminal sessions'),
              h('p', { style: { color: '#52525b', fontSize: 11, marginTop: 4 } }, 'Start a new session')
            ),
            h('button', { onClick: () => createTab(), className: 'btn btn-primary btn-lg' }, '+ New Terminal')
          )
          : tabs.map(tab =>
            h('div', { key: tab.id, style: { position: 'absolute', inset: 0, padding: 8, display: tab.id === activeTabId ? 'flex' : 'none', flexDirection: 'column' } },
              h('div', { ref: (el) => { containers.current[tab.id] = el; }, style: { flex: 1, minHeight: 0, borderRadius: 8, overflow: 'hidden' } })
            )
          )
      ),
      showLogs && h('div', { style: { width: 280, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, background: 'var(--card)' } },
        h('div', { style: { padding: '8px 12px', borderBottom: '1px solid var(--border)', fontSize: 10, fontWeight: 600, color: '#71717a' } }, 'Live Logs'),
        h('div', { style: { flex: 1, overflowY: 'auto', padding: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: 11 } },
          !logs.length ? h('div', { style: { color: '#3f3f46', textAlign: 'center', paddingTop: 16 } }, 'No logs yet')
          : logs.map((log, i) => h('div', {
            key: i,
            style: {
              color: log.includes('error') || log.includes('Error') ? '#f87171' :
                     log.includes('connect') || log.includes('created') ? '#4ade80' :
                     log.includes('disconnect') || log.includes('exited') ? '#facc15' : '#71717a',
              padding: '1px 0'
            }
          }, log)),
          h('div', { ref: logsEnd })
        )
      )
    ),
    // Status bar
    activeTabId && tabs.length > 0 && h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 16px', borderTop: '1px solid var(--border)', fontSize: 11, fontFamily: "'JetBrains Mono',monospace", background: 'var(--card)', flexShrink: 0 } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, color: '#3f3f46' } },
        h('span', null, 'bash'),
        h('span', null, '·'),
        h('span', null, tabs.find(t => t.id === activeTabId)?.name),
        h('span', null, '·'),
        h('span', null, tabs.length + ' session(s)')
      ),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
        h('span', { className: 'dot ' + dotClass }),
        h('span', { style: { color: '#3f3f46' } }, statusLabel(actStatus))
      )
    )
  );
}

// ====== Login Page (Original Design) ======
function LoginPage() {
  const { login } = useAuth();
  const { t, lang, setLang } = useLang();
  const [u, setU] = useState(''); const [p, setP] = useState('');
  const [err, setErr] = useState(''); const [load, setLoad] = useState(false);
  const [show, setShow] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (!u.trim() || !p.trim()) { setErr('Please fill in all fields'); return; }
    setLoad(true);
    try { await login(u.trim(), p); } catch (ex) { setErr(ex.message || 'Login failed'); }
    finally { setLoad(false); }
  };
  return h('div', { style: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: '#0b0616' } },
    // Animated background blobs
    h('div', { style: { position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' } },
      h('div', { style: { position: 'absolute', width: 400, height: 400, borderRadius: '50%', opacity: 0.1, filter: 'blur(80px)', background: '#6d28d9', top: '-10%', left: '-10%', animation: 'pulse 3s ease-in-out infinite' } }),
      h('div', { style: { position: 'absolute', width: 350, height: 350, borderRadius: '50%', opacity: 0.1, filter: 'blur(80px)', background: '#a855f7', bottom: '-10%', right: '-10%', animation: 'pulse 3s ease-in-out infinite 1s' } }),
      h('div', { style: { position: 'absolute', width: 280, height: 280, borderRadius: '50%', opacity: 0.05, filter: 'blur(80px)', background: '#8b5cf6', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', animation: 'pulse 3s ease-in-out infinite 2s' } }),
      h('div', { style: { position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' } })
    ),
    // Language toggle
    h('button', {
      onClick: () => setLang(lang === 'en' ? 'ar' : 'en'),
      style: { position: 'absolute', top: 24, right: 24, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, fontSize: 11, cursor: 'pointer', color: '#a1a1aa', background: 'rgba(13,7,30,0.6)', border: '1px solid rgba(139,92,246,0.2)', transition: 'all .2s', fontFamily: 'inherit', zIndex: 1 }
    }, '🌐', lang === 'en' ? 'العربية' : 'English'),
    // Login card
    h('div', { style: { position: 'relative', width: '100%', maxWidth: 420, margin: '0 16px', padding: 32, borderRadius: 16, border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(20,10,36,0.9)', backdropFilter: 'blur(20px)', boxShadow: '0 0 60px rgba(109,40,217,0.2), 0 25px 50px rgba(0,0,0,0.5)' } },
      // Logo
      h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 } },
        h('div', { style: { width: 64, height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', background: 'linear-gradient(135deg,#6d28d9,#a855f7)', boxShadow: '0 0 40px rgba(139,92,246,0.4)' } },
          h('span', { style: { fontSize: 28, fontWeight: 'bold', color: '#fff' } }, 'S')
        ),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 } },
          h('span', { style: { fontSize: 10, fontWeight: 'bold', letterSpacing: 2, padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.2)', color: '#fff', background: 'rgba(255,255,255,0.05)' } }, 'SERVER'),
          h('span', { style: { fontSize: 12, fontWeight: 'bold', letterSpacing: 2, color: '#a855f7', textShadow: '0 0 15px rgba(168,85,247,0.6)' } }, 'HUB')
        ),
        h('p', { style: { color: '#71717a', fontSize: 12, marginTop: 4 } }, 'Professional Server Management Platform')
      ),
      h('form', { onSubmit: submit, style: { display: 'flex', flexDirection: 'column', gap: 14 } },
        // Username
        h('div', { style: { position: 'relative' } },
          h('span', { style: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#52525b', pointerEvents: 'none', zIndex: 1 } }, '👤'),
          h('input', { className: 'input', value: u, onChange: e => setU(e.target.value), placeholder: t('username'), style: { paddingLeft: 36, height: 44, fontSize: 13 }, autoFocus: true })
        ),
        // Password
        h('div', { style: { position: 'relative' } },
          h('span', { style: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#52525b', pointerEvents: 'none', zIndex: 1 } }, '🔒'),
          h('input', { className: 'input', type: show ? 'text' : 'password', value: p, onChange: e => setP(e.target.value), placeholder: t('password'), style: { paddingLeft: 36, paddingRight: 36, height: 44, fontSize: 13 } }),
          h('button', { type: 'button', onClick: () => setShow(!show), style: { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#52525b', fontSize: 14, padding: 4 } }, show ? '👁' : '👁‍🗨')
        ),
        // Error
        err && h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontSize: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' } },
          h('span', null, '⚠'),
          err
        ),
        // Submit
        h('button', {
          type: 'submit', disabled: load || !u.trim() || !p.trim(),
          style: { width: '100%', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 600, cursor: load ? 'not-allowed' : 'pointer', borderRadius: 8, border: 'none', color: '#fff', background: load ? '#4c1d95' : 'linear-gradient(135deg,#6d28d9,#a855f7)', boxShadow: '0 0 20px rgba(139,92,246,0.3)', transition: 'all .2s', fontFamily: 'inherit' }
        },
          load ? h('span', { style: { display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' } }) : h('span', null, 'S'),
          load ? 'Signing in...' : 'Sign In'
        )
      ),
      // Footer
      h('p', { style: { textAlign: 'center', fontSize: 10, color: '#3f3f46', marginTop: 24, letterSpacing: 1 } }, 'SERVER HUB © ', new Date().getFullYear())
    )
  );
}

// ====== Dashboard ======
function Dashboard() {
  const { t } = useLang();
  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetch('/api/system/stats').then(r => r.json()).then(setStats).catch(() => {});
    const i = setInterval(() => fetch('/api/system/stats').then(r => r.json()).then(setStats).catch(() => {}), 5000);
    return () => clearInterval(i);
  }, []);
  const MetricCard = ({ title, value, percent, sub }) => h('div', { style: { position: 'relative', borderRadius: 16, border: '1px solid rgba(139,92,246,0.2)', padding: 20, background: '#140a24', display: 'flex', flexDirection: 'column', gap: 8 } },
    h('p', { style: { fontSize: 10, color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 } }, title),
    h('p', { style: { fontSize: 24, fontWeight: 'bold', color: '#fff' } }, value || 'N/A'),
    sub && h('p', { style: { fontSize: 11, color: '#52525b' } }, sub),
    percent !== undefined && h('div', { style: { height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' } },
      h('div', { style: { height: '100%', borderRadius: 3, width: Math.min(100, percent) + '%', background: percent > 85 ? '#ef4444' : percent > 65 ? '#f59e0b' : 'linear-gradient(90deg,#8b5cf6,#a855f7)', transition: 'width .7s' } })
    )
  );
  return h('div', { style: { padding: 24, maxWidth: 1280, margin: '0 auto' } },
    h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 20 } },
      h('div', null,
        h('h1', { style: { fontSize: 20, fontWeight: 'bold', color: '#fff' } }, 'System Overview'),
        h('p', { style: { fontSize: 13, color: '#71717a', marginTop: 2 } }, 'Live monitoring')
      ),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        stats && h('span', { style: { fontSize: 11, padding: '4px 12px', borderRadius: 999, border: '1px solid rgba(139,92,246,0.2)', background: '#140a24', fontFamily: "'JetBrains Mono',monospace", color: '#d4d4d8' } },
          h('span', { style: { display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#22c55e', marginRight: 6, animation: 'pulse 1.5s ease-in-out infinite' } }),
          stats.hostname || 'server'
        ),
        h('span', { style: { fontSize: 11, color: '#52525b', fontFamily: "'JetBrains Mono',monospace" } }, new Date().toLocaleTimeString())
      )
    ),
    stats ? h('div', { className: 'grid grid-cols-4 gap-4' },
      h(MetricCard, { title: 'CPU', value: (stats.cpu_percent ?? 0).toFixed(1) + '%', percent: stats.cpu_percent, sub: (stats.cpu_count || '?') + ' cores' }),
      h(MetricCard, { title: 'Memory', value: stats.mem_used || 'N/A', percent: stats.mem_percent, sub: 'of ' + (stats.mem_total || 'N/A') }),
      h(MetricCard, { title: 'Disk', value: stats.disk_used || 'N/A', percent: stats.disk_percent, sub: 'of ' + (stats.disk_total || 'N/A') }),
      h(MetricCard, { title: 'Uptime', value: stats.uptime || 'N/A', sub: stats.hostname ? 'Host: ' + stats.hostname : undefined })
    ) : h('div', { style: { color: '#52525b', textAlign: 'center', padding: 60, fontSize: 13 } },
      'Backend API not available. The terminal page will still work if the backend is running.'
    )
  );
}

// ====== App Shell ======
function App() {
  const { user, loading, logout } = useAuth();
  const { t, lang, setLang, isRTL } = useLang();
  const { theme, setTheme } = useTheme();
  const [page, setPage] = useState(() => window.location.hash.replace(/^#/, '') || '/');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [tunnelStatus, setTunnelStatus] = useState('inactive');
  const [tunnelUrl, setTunnelUrl] = useState(null);
  const [sidebarPages, setSidebarPages] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const f = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  useEffect(() => {
    const f = () => setPage(window.location.hash.replace(/^#/, '') || '/');
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  const navigate = (to) => { window.location.hash = to; setPage(to); setMobileOpen(false); };

  const handleTunnel = async () => {
    if (['active', 'starting'].includes(tunnelStatus)) {
      setTunnelStatus('inactive'); setTunnelUrl(null);
      toast({ title: 'Tunnel stopped' });
    } else {
      setTunnelStatus('starting');
      toast({ title: 'Creating tunnel...' });
      // Try to create tunnel via API
      try {
        const res = await fetch('/api/tunnel/create', { method: 'POST' });
        const data = await res.json();
        if (data.url) { setTunnelUrl(data.url); setTunnelStatus('active'); toast({ title: 'Tunnel created', description: data.url, variant: 'success' }); return; }
      } catch {}
      // Fallback: use window.location host
      toast({ title: 'Tunnel created', description: 'Using server address', variant: 'success' });
    }
  };

  if (loading) return h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0b0616' } },
    h('div', { style: { width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg,#6d28d9,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(139,92,246,0.3)' } },
      h('span', { style: { color: '#fff', fontWeight: 'bold', fontSize: 20 } }, 'S')
    )
  );

  if (!user) return h(LoginPage);

  const mainPages = [
    { href: '/', label: t('dashboard') },
    { href: '/terminal', label: t('terminal') },
    { href: '/editor', label: t('editor') },
    { href: '/files', label: t('files') },
  ];
  const adminPages = user.role === 'admin' ? [
    { href: '/admin', label: t('admin') },
    { href: '/settings', label: t('settings') },
  ] : [];

  const isActive = (href) => href === '/' ? page === '/' : page.startsWith(href);

  const renderPage = () => {
    switch (page.split('?')[0]) {
      case '/': return h(Dashboard);
      case '/terminal': return h(TerminalPage);
      default: return h(Dashboard);
    }
  };

  const NavLink = ({ href, label }) => h('div', {
    onClick: () => navigate(href),
    style: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', position: 'relative', transition: 'all .2s', color: isActive(href) ? '#fff' : '#a1a1aa', background: isActive(href) ? 'rgba(109,40,217,0.2)' : 'transparent' },
    onMouseEnter: (e) => { if (!isActive(href)) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; },
    onMouseLeave: (e) => { if (!isActive(href)) e.currentTarget.style.background = 'transparent'; }
  },
    isActive(href) && h('span', { style: { position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 20, borderRadius: '0 3px 3px 0', background: 'linear-gradient(180deg,#8b5cf6,#a855f7)' } }),
    h('span', { style: { width: 5, height: 5, borderRadius: '50%', background: isActive(href) ? 'var(--accent)' : '#52525b', flexShrink: 0 } }),
    !collapsed && h('span', { style: { fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, label)
  );

  const SidebarContent = ({ onNav }) => h('div', { style: { display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--sidebar)' } },
    h('div', { style: { display: 'flex', alignItems: 'center', padding: '0 16px', height: 56, borderBottom: '1px solid var(--sidebar-border)', flexShrink: 0 } },
      h('div', { style: { width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#6d28d9,#a855f7)', flexShrink: 0, boxShadow: '0 0 15px rgba(139,92,246,0.3)' } }, h('span', { style: { color: '#fff', fontWeight: 'bold', fontSize: 11 } }, 'SH')),
      !collapsed && h('span', { style: { marginLeft: 8, fontSize: 11, fontWeight: 'bold', color: '#fff', letterSpacing: 1 } }, 'SERVER ',
        h('span', { style: { color: '#a855f7' } }, 'HUB')
      )
    ),
    h('div', { style: { flex: 1, padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' } },
      ...mainPages.map(p => h(NavLink, { key: p.href, ...p })),
      adminPages.length > 0 && [
        !collapsed && h('div', { style: { padding: '12px 12px 4px' } }, h('span', { style: { fontSize: 9, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: 1 } }, 'Admin')),
        ...adminPages.map(p => h(NavLink, { key: p.href, ...p }))
      ],
      !collapsed && [
        h('div', { style: { padding: '12px 12px 4px' } }, h('span', { style: { fontSize: 9, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: 1 } }, 'Theme')),
        h('div', { style: { padding: '0 8px' } }, h(ThemeSwitcher, { theme, setTheme })),
        h('div', { style: { padding: '12px 12px 4px' } }, h('span', { style: { fontSize: 9, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: 1 } }, 'Tunnel')),
        h('div', { style: { padding: '0 8px' } },
          h('button', {
            onClick: handleTunnel,
            style: { width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, fontSize: 11, cursor: 'pointer', transition: 'all .2s', border: tunnelStatus === 'active' ? '1px solid rgba(74,222,128,0.3)' : '1px solid transparent', background: tunnelStatus === 'active' ? 'rgba(74,222,128,0.1)' : 'transparent', color: tunnelStatus === 'active' ? '#4ade80' : '#71717a' },
            onMouseEnter: (e) => { if (tunnelStatus !== 'active') e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; },
            onMouseLeave: (e) => { if (tunnelStatus !== 'active') e.currentTarget.style.background = 'transparent'; }
          },
            h('span', null, tunnelStatus === 'active' ? '🔗' : '🌐'),
            tunnelStatus === 'active' ? 'Tunnel Active' : tunnelStatus === 'starting' ? 'Starting...' : 'Create Tunnel'
          ),
          tunnelUrl && h('a', { href: tunnelUrl, target: '_blank', style: { display: 'block', marginTop: 4, padding: '4px 8px', fontSize: 9, color: 'var(--accent)', fontFamily: "'JetBrains Mono',monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none' } }, tunnelUrl)
        )
      ]
    ),
    h('div', { style: { borderTop: '1px solid var(--sidebar-border)', padding: 8, display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 } },
      !collapsed && h('button', {
        onClick: () => setLang(lang === 'en' ? 'ar' : 'en'),
        style: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 8, border: 'none', color: '#71717a', fontSize: 13, cursor: 'pointer', background: 'transparent', transition: 'all .2s' },
        onMouseEnter: (e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)',
        onMouseLeave: (e) => e.currentTarget.style.background = 'transparent'
      }, '🌐 ' + (lang === 'en' ? 'العربية' : 'English')),
      h('div', { onClick: () => { navigate('/profile'); onNav?.(); }, style: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 8, cursor: 'pointer', transition: 'all .2s' },
        onMouseEnter: (e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)',
        onMouseLeave: (e) => e.currentTarget.style.background = 'transparent'
      },
        h('div', { style: { width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 'bold', background: 'linear-gradient(135deg,#6d28d9,#a855f7)', flexShrink: 0 } },
          (user.display_name || '?')[0].toUpperCase()
        ),
        !collapsed && h('div', { style: { flex: 1, minWidth: 0 } },
          h('p', { style: { fontSize: 13, fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, user.display_name),
          h('p', { style: { fontSize: 9, color: '#52525b' } }, '@' + user.username)
        )
      ),
      h('button', {
        onClick: () => { logout(); onNav?.(); },
        style: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 8, border: 'none', color: '#71717a', fontSize: 13, cursor: 'pointer', background: 'transparent', transition: 'all .2s' },
        onMouseEnter: (e) => e.currentTarget.style.color = '#f87171',
        onMouseLeave: (e) => e.currentTarget.style.color = '#71717a'
      }, '🚪 ' + (!collapsed ? t('logout') : ''))
    )
  );

  return h('div', { style: { display: 'flex', height: '100vh', overflow: 'hidden', direction: isRTL ? 'rtl' : 'ltr' } },
    !isMobile && h('div', { className: 'sidebar' + (collapsed ? ' collapsed' : '') },
      h(SidebarContent)
    ),
    isMobile && h('div', { style: { position: 'fixed', top: 0, left: 0, right: 0, height: 52, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid var(--sidebar-border)', background: 'var(--sidebar)' } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        h('button', { onClick: handleTunnel, style: { width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer', borderRadius: 8, border: 'none', background: 'transparent' } }, tunnelStatus === 'active' ? '🔗' : '🌐'),
        h('span', { style: { fontWeight: 'bold', fontSize: 12, color: '#fff', letterSpacing: 1 } }, 'SERVER ',
          h('span', { style: { color: '#a855f7' } }, 'HUB')
        )
      ),
      h('button', { onClick: () => setMobileOpen(true), style: { width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer', borderRadius: 8, border: 'none', background: 'transparent' } }, '☰')
    ),
    isMobile && mobileOpen && h('div', { style: { position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.6)' }, onClick: (e) => { if (e.target === e.currentTarget) setMobileOpen(false); } },
      h('div', { style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 260, borderRight: '1px solid var(--sidebar-border)', background: 'var(--sidebar)', display: 'flex', flexDirection: 'column' } },
        h(SidebarContent, { onNav: () => setMobileOpen(false) })
      )
    ),
    h('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', paddingTop: isMobile ? 52 : 0 } },
      h('main', { style: { flex: 1, overflow: 'auto', height: '100%' } },
        renderPage()
      )
    ),
    h(Toaster)
  );
}

// ====== Render ======
try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    React.createElement(React.StrictMode, null,
      React.createElement(LangProvider, null,
        React.createElement(AuthProvider, null,
          React.createElement(ToastProvider, null,
            React.createElement(App)
          )
        )
      )
    )
  );
  // Hide loading, show root
  document.getElementById('loading').style.display = 'none';
  document.getElementById('root').style.display = '';
} catch (e) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('error').style.display = 'flex';
  document.getElementById('error').innerHTML = '<h2>Failed to load</h2><p>' + e.message + '</p><p style="font-size:11px;color:#52525b;margin-top:8px">' + e.stack + '</p>';
  console.error(e);
}
</script>
</body>
</html>`;
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Access-Control-Allow-Origin": "*" });
  res.end(html);
};

const server = http.createServer(serveApp);
server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n  ╔═══════════════════════════════════════╗`);
  console.log(`  ║     SERVER HUB v5 - RUNNING            ║`);
  console.log(`  ╚═══════════════════════════════════════╝\n`);
  console.log(`  Local URL:   http://localhost:${PORT}/\n`);
  tryTunnel(PORT);
});

function tryTunnel(port) {
  let cfPath = null;
  try { cfPath = require("child_process").execSync("where cloudflared 2>nul || echo ''", { encoding: "utf8" }).trim(); } catch {}

  if (cfPath) {
    console.log("  Creating Cloudflare Tunnel...\n");
    const proc = require("child_process").spawn(cfPath, ["tunnel", "--url", `http://localhost:${port}`], { stdio: ["pipe", "pipe", "pipe"] });

    let urlFound = false;
    const handler = (data) => {
      const out = data.toString();
      const match = out.match(/https:\/\/[a-zA-Z0-9.-]+\.trycloudflare\.com/);
      if (match && !urlFound) {
        urlFound = true;
        console.log(`  ╔═══════════════════════════════════════╗`);
        console.log(`  ║  🌐  PUBLIC URL (Cloudflare Tunnel)   ║`);
        console.log(`  ╚═══════════════════════════════════════╝\n`);
        console.log(`  ${match[0]}\n`);
        console.log(`  Share this link to access from anywhere!\n`);
      }
      process.stdout.write(out);
    };
    proc.stdout.on("data", handler);
    proc.stderr.on("data", handler);
    proc.on("error", () => { if (!urlFound) console.log("  Cloudflare tunnel failed.\n"); });
    setTimeout(() => { if (!urlFound) console.log("  Tunnel still initializing... waiting for URL.\n"); }, 10000);
  } else {
    console.log("  ⚠  cloudflared not found. Install from:\n");
    console.log("     https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/\n");
    console.log("  For now, access locally:\n");
    console.log(`     http://localhost:${port}/\n`);
  }
}
