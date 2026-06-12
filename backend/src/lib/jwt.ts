import jwt from "jsonwebtoken";
import { logger } from "./logger";

const SECRET = process.env.SESSION_SECRET || "";

if (!SECRET) {
  logger.error("SESSION_SECRET environment variable is required");
  process.exit(1);
}

export interface JwtPayload {
  userId: string;
  username: string;
  role: "admin" | "user";
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
