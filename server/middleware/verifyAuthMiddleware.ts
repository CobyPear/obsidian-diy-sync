// TODO: implement jwt auth middleware
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ReqUser } from "../types";

export const verifyAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cookie = req.get("cookie"); // get the cookie header
    const token = cookie?.split("access_token=")[1];

    if (!token) return res.sendStatus(401);

    const user = jwt.verify(token, process.env.JWT_SECRET as string) as ReqUser;
    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }
};
