import { Router, type IRouter, Request, Response } from "express";
import { dockerManager } from "../lib/docker-manager";
import { authenticate } from "../middleware/authenticate";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/docker/status", authenticate, async (_req: Request, res: Response) => {
  res.json({
    available: dockerManager.isAvailable,
    containers: dockerManager.getAllContainerInfos().map((c) => ({
      username: c.username,
      id: c.id,
      status: c.status,
      created: c.created,
      restartCount: c.restartCount,
    })),
  });
});

router.get("/docker/container/:username", authenticate, async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const info = await dockerManager.getContainerInfo(username);
    if (!info) {
      res.status(404).json({ error: "Container not found" });
      return;
    }
    res.json(info);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/docker/container/:username/start", authenticate, async (req: Request, res: Response) => {
  try {
    const ok = await dockerManager.startContainer(req.params.username);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/docker/container/:username/stop", authenticate, async (req: Request, res: Response) => {
  try {
    const ok = await dockerManager.stopContainer(req.params.username);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/docker/container/:username/restart", authenticate, async (req: Request, res: Response) => {
  try {
    const ok = await dockerManager.restartContainer(req.params.username);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/docker/container/:username/pause", authenticate, async (req: Request, res: Response) => {
  try {
    const ok = await dockerManager.pauseContainer(req.params.username);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/docker/container/:username/unpause", authenticate, async (req: Request, res: Response) => {
  try {
    const ok = await dockerManager.unpauseContainer(req.params.username);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/docker/container/:username", authenticate, async (req: Request, res: Response) => {
  try {
    const ok = await dockerManager.removeContainer(req.params.username);
    res.json({ success: ok });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/docker/container/:username/stats", authenticate, async (req: Request, res: Response) => {
  try {
    const stats = await dockerManager.getContainerStats(req.params.username);
    if (!stats) {
      res.status(404).json({ error: "Container not found or stats unavailable" });
      return;
    }
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/docker/container/:username/logs", authenticate, async (req: Request, res: Response) => {
  try {
    const tail = parseInt(req.query.tail as string) || 100;
    const logs = await dockerManager.getContainerLogs(req.params.username, tail);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/docker/container/:username/processes", authenticate, async (req: Request, res: Response) => {
  try {
    const procs = await dockerManager.getContainerProcesses(req.params.username);
    res.json(procs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/docker/stats", authenticate, async (_req: Request, res: Response) => {
  try {
    const allStats = await dockerManager.getContainerStatsAll();
    res.json(allStats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/docker/info", authenticate, async (_req: Request, res: Response) => {
  try {
    const infos = dockerManager.getAllContainerInfos();
    const detailed = await Promise.all(
      infos.map(async (info) => {
        const stats = await dockerManager.getContainerStats(info.username);
        return { ...info, stats };
      })
    );
    res.json({
      available: dockerManager.isAvailable,
      containers: detailed,
      total: detailed.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
