import { Router, type IRouter } from "express";
import { Request, Response } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  source: string;
}

const logHistory: LogEntry[] = [];
const MAX_LOGS = 500;

export function addLog(level: string, message: string, source: string = "system"): void {
  logHistory.push({
    timestamp: new Date().toISOString(),
    level,
    message,
    source,
  });
  if (logHistory.length > MAX_LOGS) {
    logHistory.splice(0, logHistory.length - MAX_LOGS);
  }
}

router.get("/logs", async (_req: Request, res: Response): Promise<void> => {
  const source = _req.query.source as string | undefined;
  const level = _req.query.level as string | undefined;
  const limit = Math.min(parseInt(_req.query.limit as string) || 100, 500);

  let filtered = logHistory;
  if (source) filtered = filtered.filter((l) => l.source === source);
  if (level) filtered = filtered.filter((l) => l.level === level);

  res.json(filtered.slice(-limit));
});

router.delete("/logs", async (_req: Request, res: Response): Promise<void> => {
  logHistory.length = 0;
  res.json({ success: true, message: "Logs cleared" });
});

export default router;
