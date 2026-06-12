import { Router, type IRouter } from "express";
import { Request, Response } from "express";
import { logger } from "../lib/logger";
import { authenticate } from "../middleware/authenticate";

const router: IRouter = Router();

interface ActivityEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  details: string;
  ip: string;
  status: "success" | "failed" | "info";
}

const activityLog: ActivityEntry[] = [];
const MAX_ENTRIES = 2000;

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function logActivity(data: {
  user: string;
  action: string;
  target: string;
  details?: string;
  ip?: string;
  status?: "success" | "failed" | "info";
}): void {
  activityLog.push({
    id: generateId(),
    timestamp: new Date().toISOString(),
    user: data.user,
    action: data.action,
    target: data.target,
    details: data.details || "",
    ip: data.ip || "unknown",
    status: data.status || "info",
  });
  if (activityLog.length > MAX_ENTRIES) {
    activityLog.splice(0, activityLog.length - MAX_ENTRIES);
  }
}

router.get("/activity", authenticate, async (req: Request, res: Response): Promise<void> => {
  const user = req.query.user as string | undefined;
  const action = req.query.action as string | undefined;
  const status = req.query.status as string | undefined;
  const search = req.query.q as string | undefined;
  const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
  const offset = parseInt(req.query.offset as string) || 0;

  let filtered = [...activityLog];

  if (user) filtered = filtered.filter((e) => e.user.toLowerCase().includes(user.toLowerCase()));
  if (action) filtered = filtered.filter((e) => e.action === action);
  if (status) filtered = filtered.filter((e) => e.status === status);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((e) =>
      e.user.toLowerCase().includes(q) ||
      e.action.toLowerCase().includes(q) ||
      e.target.toLowerCase().includes(q) ||
      e.details.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const items = filtered.reverse().slice(offset, offset + limit);

  res.json({ items, total, offset, limit });
});

router.get("/activity/stats", authenticate, async (_req: Request, res: Response): Promise<void> => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekAgo = today - 7 * 24 * 60 * 60 * 1000;

  const todayCount = activityLog.filter((e) => new Date(e.timestamp).getTime() >= today).length;
  const weekCount = activityLog.filter((e) => new Date(e.timestamp).getTime() >= weekAgo).length;

  const actionCounts: Record<string, number> = {};
  const userCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = { success: 0, failed: 0, info: 0 };

  for (const entry of activityLog) {
    actionCounts[entry.action] = (actionCounts[entry.action] || 0) + 1;
    userCounts[entry.user] = (userCounts[entry.user] || 0) + 1;
    statusCounts[entry.status] = (statusCounts[entry.status] || 0) + 1;
  }

  const topActions = Object.entries(actionCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topUsers = Object.entries(userCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  res.json({
    total: activityLog.length,
    today: todayCount,
    thisWeek: weekCount,
    topActions: topActions.map(([action, count]) => ({ action, count })),
    topUsers: topUsers.map(([user, count]) => ({ user, count })),
    byStatus: statusCounts,
  });
});

router.delete("/activity", authenticate, async (req: Request, res: Response): Promise<void> => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Admin only" });
    return;
  }
  activityLog.length = 0;
  res.json({ success: true, message: "Activity log cleared" });
});

export default router;
