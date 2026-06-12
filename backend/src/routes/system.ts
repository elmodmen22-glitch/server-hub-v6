import os from "os";
import { Router, type IRouter } from "express";
import { execSync } from "child_process";
import { logger } from "../lib/logger";
import { authenticate } from "../middleware/authenticate";
import { dockerManager } from "../lib/docker-manager";

const router: IRouter = Router();
const isWindows = process.platform === "win32";

function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}

function safeExec(cmd: string): string {
  try {
    return execSync(cmd, { encoding: "utf8", timeout: 5000, windowsHide: true }).trim();
  } catch {
    return "";
  }
}

function getCpuPercent(): number {
  if (isWindows) {
    try {
      const result = safeExec('powershell -NoProfile -Command "(Get-CimInstance Win32_Processor).LoadPercentage"');
      const val = parseInt(result, 10);
      return isNaN(val) ? 0 : val;
    } catch { return 0; }
  }
  try {
    const result = safeExec("grep 'cpu ' /proc/stat");
    const parts = result.split(/\s+/);
    const total = parts.slice(1, 8).reduce((a, b) => a + Number(b), 0);
    const idle = Number(parts[4]);
    return Math.round(((total - idle) / total) * 100);
  } catch { return 0; }
}

function getMemInfo(): { total: number; used: number; available: number } {
  if (isWindows) {
    try {
      const result = safeExec('powershell -NoProfile -Command "$os=Get-CimInstance Win32_OperatingSystem; @{Total=[math]::Round($os.TotalVisibleMemorySize*1024); Free=[math]::Round($os.FreePhysicalMemory*1024)}"');
      const match = result.match(/Total\s*:\s*(\d+)/);
      const matchFree = result.match(/Free\s*:\s*(\d+)/);
      const total = match ? parseInt(match[1], 10) : os.totalmem();
      const free = matchFree ? parseInt(matchFree[1], 10) : os.freemem();
      return { total, used: total - free, available: free };
    } catch {
      const total = os.totalmem();
      const free = os.freemem();
      return { total, used: total - free, available: free };
    }
  }
  try {
    const content = safeExec("cat /proc/meminfo");
    const lines = content.split("\n");
    const getVal = (key: string) => {
      const line = lines.find((l) => l.startsWith(key));
      if (!line) return 0;
      return parseInt(line.split(/\s+/)[1], 10) * 1024;
    };
    const total = getVal("MemTotal:");
    const free = getVal("MemFree:");
    const buffers = getVal("Buffers:");
    const cached = getVal("Cached:");
    const sreclaimable = getVal("SReclaimable:");
    const available = free + buffers + cached + sreclaimable;
    return { total, used: total - available, available };
  } catch {
    return { total: 0, used: 0, available: 0 };
  }
}

function getDiskInfo(): { total: number; used: number; free: number } {
  if (isWindows) {
    try {
      const drive = process.env.SystemDrive || "C:";
      const result = safeExec(`powershell -NoProfile -Command "Get-PSDrive -Name ${drive[0]} | Select-Object Used,Free | ConvertTo-Json"`);
      const json = JSON.parse(result);
      const used = json.Used || 0;
      const free = json.Free || 0;
      return { total: used + free, used, free };
    } catch {
      try {
        const drive = process.env.SystemDrive || "C:";
        const result = safeExec(`wmic logicaldisk where "DeviceID='${drive}'" get Size,FreeSpace /format:csv`);
        const lines = result.split("\n").filter((l) => l.trim());
        if (lines.length >= 2) {
          const parts = lines[1].split(",");
          const free = parseInt(parts[1], 10) || 0;
          const total = parseInt(parts[2], 10) || 0;
          return { total, used: total - free, free };
        }
      } catch {}
      return { total: 0, used: 0, free: 0 };
    }
  }
  try {
    const result = safeExec("df -B1 / | tail -1");
    const parts = result.split(/\s+/);
    return { total: Number(parts[1]), used: Number(parts[2]), free: Number(parts[3]) };
  } catch {
    return { total: 0, used: 0, free: 0 };
  }
}

function getNetStats(): { sent: number; recv: number } {
  if (isWindows) {
    try {
      const result = safeExec('netstat -e');
      const lines = result.split("\n");
      let sent = 0, recv = 0;
      for (const line of lines) {
        const trimmed = line.trim().toLowerCase();
        if (trimmed.startsWith("bytes sent")) {
          const match = trimmed.match(/bytes sent\s*:\s*(\d+)/);
          if (match) sent = parseInt(match[1], 10);
        }
        if (trimmed.startsWith("bytes received")) {
          const match = trimmed.match(/bytes received\s*:\s*(\d+)/);
          if (match) recv = parseInt(match[1], 10);
        }
      }
      return { sent, recv };
    } catch { return { sent: 0, recv: 0 }; }
  }
  try {
    const result = safeExec("cat /proc/net/dev");
    let sent = 0, recv = 0;
    result.split("\n").forEach((line) => {
      const parts = line.trim().split(/\s+/);
      if (parts[0] && parts[0].endsWith(":") && !parts[0].startsWith("lo")) {
        recv += Number(parts[1]) || 0;
        sent += Number(parts[9]) || 0;
      }
    });
    return { sent, recv };
  } catch { return { sent: 0, recv: 0 }; }
}

function getUptime(): string {
  if (isWindows) {
    try {
      const result = safeExec('powershell -NoProfile -Command "(Get-CimInstance Win32_OperatingSystem).LastBootUpTime"');
      if (result) {
        const bootTime = new Date(result);
        const diff = (Date.now() - bootTime.getTime()) / 1000;
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = Math.floor(diff % 60);
        return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      }
    } catch {}
    const upSecs = os.uptime();
    const h = Math.floor(upSecs / 3600);
    const m = Math.floor((upSecs % 3600) / 60);
    const s = Math.floor(upSecs % 60);
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  try {
    const secs = parseFloat(safeExec("cat /proc/uptime").split(" ")[0]);
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  } catch { return "N/A"; }
}

function getHostname(): string {
  return os.hostname();
}

function getIp(): string {
  if (isWindows) {
    try {
      const result = safeExec('powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike \'Loopback*\' -and $_.IPAddress -ne \'127.0.0.1\' } | Select-Object -First 1).IPAddress"');
      if (result && result !== "N/A") return result;
    } catch {}
  }
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "127.0.0.1";
}

router.get("/system/stats", async (_req, res): Promise<void> => {
  try {
    const mem = getMemInfo();
    const disk = getDiskInfo();
    const net = getNetStats();
    const memPercent = mem.total > 0 ? Math.round((mem.used / mem.total) * 100) : 0;
    const diskPercent = disk.total > 0 ? Math.round((disk.used / disk.total) * 100) : 0;

    const stats = {
      cpu_percent: getCpuPercent(),
      cpu_count: os.cpus().length,
      cpu_freq: "N/A",
      mem_total: formatBytes(mem.total),
      mem_used: formatBytes(mem.used),
      mem_percent: memPercent,
      mem_available: formatBytes(mem.available),
      disk_total: formatBytes(disk.total),
      disk_used: formatBytes(disk.used),
      disk_percent: diskPercent,
      disk_free: formatBytes(disk.free),
      net_sent: formatBytes(net.sent),
      net_recv: formatBytes(net.recv),
      uptime: getUptime(),
      hostname: getHostname(),
      ip: getIp(),
      processes: getProcessCount(),
      load_avg: 0,
      timestamp: new Date().toTimeString().slice(0, 8),
    };

    res.json(stats);
  } catch (err) {
    logger.error({ err }, "Failed to get system stats");
    res.status(500).json({ error: "Failed to get system stats" });
  }
});

// Per-user container stats
router.get("/system/container-stats", authenticate, async (req, res): Promise<void> => {
  try {
    const username = req.user?.username || "";
    if (!username) { res.json(null); return; }
    const stats = await dockerManager.getContainerStats(username);
    res.json(stats);
  } catch (err) {
    logger.error({ err }, "Failed to get container stats");
    res.json(null);
  }
});

router.get("/system/container-processes", authenticate, async (req, res): Promise<void> => {
  try {
    const username = req.user?.username || "";
    if (!username) { res.json([]); return; }
    const procs = await dockerManager.getContainerProcesses(username);
    res.json(procs);
  } catch (err) {
    logger.error({ err }, "Failed to get container processes");
    res.json([]);
  }
});

function getProcessCount(): number {
  if (isWindows) {
    try {
      const result = safeExec('tasklist /FO CSV /NH');
      return result.split("\n").filter((l) => l.trim()).length;
    } catch { return 0; }
  }
  try {
    return parseInt(safeExec("ls /proc | grep -c '^[0-9]'"), 10);
  } catch { return 0; }
}

router.get("/system/ports", async (_req, res): Promise<void> => {
  try {
    const ports: Array<{ port: number; addr: string; pid: number | null; process: string }> = [];

    if (isWindows) {
      const result = safeExec("netstat -ano -p TCP");
      const lines = result.split("\n").filter((l) => l.trim().includes("LISTENING"));
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const localAddr = parts[1] || "";
        const pidStr = parts[parts.length - 1] || "";
        const lastColon = localAddr.lastIndexOf(":");
        if (lastColon < 0) continue;
        const portStr = localAddr.slice(lastColon + 1);
        const port = parseInt(portStr, 10);
        if (isNaN(port) || port <= 0) continue;
        const host = localAddr.slice(0, lastColon);
        const pid = pidStr !== "0" ? parseInt(pidStr, 10) : null;
        let processName = "system";
        if (pid && pid > 0) {
          try {
            const taskResult = safeExec(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`);
            const match = taskResult.match(/"([^"]+)"/);
            if (match) processName = match[1];
          } catch {}
        }
        ports.push({ port, addr: host || "0.0.0.0", pid, process: processName });
      }
    } else {
      const result = safeExec("ss -tlnp 2>/dev/null | awk 'NR>1 {print $4, $6}' | head -30");
      result.split("\n").forEach((line) => {
        if (!line.trim()) return;
        const parts = line.split(/\s+/);
        const addr = parts[0] || "";
        const pidInfo = parts[1] || "";
        const lastColon = addr.lastIndexOf(":");
        const portStr = addr.slice(lastColon + 1);
        const port = parseInt(portStr, 10);
        if (isNaN(port) || port <= 0) return;
        const host = addr.slice(0, lastColon);
        const pidMatch = pidInfo.match(/pid=(\d+)/);
        const pid = pidMatch ? parseInt(pidMatch[1], 10) : null;
        const nameMatch = pidInfo.match(/\("([^"]+)"/);
        const process = nameMatch ? nameMatch[1] : "system";
        ports.push({ port, addr: host || "0.0.0.0", pid, process });
      });
    }

    res.json(ports.slice(0, 20));
  } catch (err) {
    logger.error({ err }, "Failed to get open ports");
    res.json([]);
  }
});

router.get("/system/processes", async (_req, res): Promise<void> => {
  try {
    if (isWindows) {
      const result = safeExec('powershell -NoProfile -Command "Get-Process | Sort-Object CPU -Descending | Select-Object -First 20 Id,ProcessName,CPU,@{N=\'MemKB\';E={[math]::Round($_.WorkingSet64/1KB)}} | ConvertTo-Json"');
      try {
        const json = JSON.parse(result);
        const list = Array.isArray(json) ? json : [json];
        const processes = list.map((p: any) => ({
          pid: p.Id || 0, name: p.ProcessName || "unknown", status: "R",
          cpu: Math.round((p.CPU || 0) * 10) / 10, memory: p.MemKB || 0, cmdline: p.ProcessName || "",
        }));
        res.json(processes);
      } catch { res.json([]); }
      return;
    }
    const result = safeExec("ps aux --sort=-%cpu 2>/dev/null | head -21 | tail -20");
    const processes = result.split("\n").filter(Boolean).map((line) => {
      const parts = line.trim().split(/\s+/);
      return {
        pid: parseInt(parts[1], 10) || 0,
        name: parts[10] ? parts[10].split("/").pop() || parts[10] : "unknown",
        status: parts[7] || "S", cpu: parseFloat(parts[2]) || 0,
        memory: parseFloat(parts[3]) || 0, cmdline: parts.slice(10).join(" ").slice(0, 80),
      };
    });
    res.json(processes);
  } catch (err) {
    logger.error({ err }, "Failed to get processes");
    res.json([]);
  }
});

router.delete("/system/processes/:pid", authenticate, async (req, res): Promise<void> => {
  try {
    const rawPid = Array.isArray(req.params.pid) ? req.params.pid[0] : req.params.pid;
    const pid = parseInt(rawPid, 10);
    if (isNaN(pid) || pid <= 1) {
      res.status(400).json({ success: false, message: "Invalid PID" });
      return;
    }
    try {
      if (isWindows) {
        execSync(`taskkill /PID ${pid} /F`, { encoding: "utf8", timeout: 5000, windowsHide: true });
      } else {
        execSync(`kill -9 ${pid}`, { timeout: 3000 });
      }
      res.json({ success: true, message: `Process ${pid} killed` });
    } catch {
      res.json({ success: false, message: `Could not kill process ${pid}` });
    }
  } catch (err) {
    logger.error({ err }, "Failed to kill process");
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
