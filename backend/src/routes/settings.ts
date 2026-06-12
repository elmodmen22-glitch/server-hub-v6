import { Router, type IRouter } from "express";
import { Request, Response } from "express";
import { storage } from "../lib/storage";
import { sendTelegram } from "../lib/telegram";
import { authenticate, requireAdmin } from "../middleware/authenticate";

const router: IRouter = Router();

router.get("/settings", authenticate, async (_req: Request, res: Response): Promise<void> => {
  res.json(storage.getSettings());
});

router.put("/settings", authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const settings = storage.updateSettings(req.body);
  res.json(settings);
});

router.post("/settings/telegram/test", authenticate, async (_req: Request, res: Response): Promise<void> => {
  const ok = await sendTelegram("🧪 *Test message*\nSERVER HUB v5 notification system is working!");
  res.json({ success: ok });
});

export default router;
