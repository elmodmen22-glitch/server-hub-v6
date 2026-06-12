import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../lib/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const AUTH_BYPASS_ALLOWED = process.env.DISABLE_AUTH === "true";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  if (AUTH_BYPASS_ALLOWED) {
    if (IS_PRODUCTION) {
      res.status(500).json({ error: "DISABLE_AUTH is not allowed in production" });
      return;
    }
    req.user = { userId: "dev", username: "dev", role: "admin" } as any;
    next();
    return;
  }
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized - no token provided" });
    return;
  }
  const token = auth.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Unauthorized - invalid or expired token" });
    return;
  }

  // Check token type for admin routes
  const isAdminRoute = req.path.includes("/users") ||
    req.path.includes("/system/processes");
  if (isAdminRoute && payload.role !== "admin") {
    res.status(403).json({ error: "Forbidden - insufficient permissions" });
    return;
  }

  req.user = payload;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Forbidden - admin only" });
    return;
  }
  next();
}
