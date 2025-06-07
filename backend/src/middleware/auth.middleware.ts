import jwt from "jsonwebtoken";
import "dotenv/config";
import type { NextFunction, Response } from "express";
import ApiContext from "../models/context.js";

const authMiddle = (req: any, res: Response, next: NextFunction) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const token: string | undefined = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Auth error" });
    }
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET_KEY as string);
    const id = Number(decoded.payload) === decoded.payload ? decoded.payload : decoded;
    req.user = { id, ...decoded }; // obsolete, but kept for compatibility
    // TODO: replace req.user with req.context in code
    req.context = new ApiContext(id);
    next();
  } catch (e: any) {
    return res.status(401).json({ message: "Auth error", error: e.message });
  }
};

export default authMiddle;
