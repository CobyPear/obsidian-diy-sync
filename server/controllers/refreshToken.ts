import type { Request, Response } from "express";
import { prisma } from "../db";
import { generateToken } from "../utils/generateToken";
import jwt from "jsonwebtoken";

export const refreshControllers = {
  post: async (req: Request, res: Response) => {
    
    const cookie = req.get("cookie");
    const matches = /refresh_token=(?<refreshToken>.*);/g.exec(
      cookie as string
      );
      if (matches && matches.groups) {
        const refreshToken = matches.groups.refreshToken;
        
        const user = await prisma.user.findUnique({
          where: {
            username: req.body.username,
          },
          select: {
            id: true,
            username: true,
            refreshToken: true,
          },
        });
      if (user?.refreshToken === refreshToken) {
        const isValid = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET as string
        );
        if (isValid) {
          const newAccessToken = generateToken(
            user.id,
            user.username,
            "15m",
            "access"
          );
          const newRefreshToken = generateToken(
            user.id,
            user.username,
            "7d",
            "refresh"
          );

          res.cookie("access_token", newAccessToken, {
            maxAge: 15 * 60 * 1000, // 15 min
            sameSite: "none",
            secure: true,
            httpOnly: true,
          });
          res.cookie("refresh_token", newRefreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
            sameSite: "none",
            secure: true,
            httpOnly: true,
          });

          res.json({ message: "Tokens Refreshed" });
        }
      }
    }
  },
};
