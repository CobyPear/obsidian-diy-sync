// TODO: implement jwt auth middleware
import type { Response, NextFunction } from "express";
import { RequestWithUser } from "../types";
import jwt from "jsonwebtoken";

export const authMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.sendStatus(401);

    const user = jwt.verify(token, process.env.TOKEN_SECRET as string);
    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {
    return res.status(500).json(error);
  }
};
