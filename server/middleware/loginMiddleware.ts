import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../db";
import { generateToken } from "../utils/generateToken";

export const loginMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password: plaintextPw } = req.body;
  console.log("uname,pwd", username, plaintextPw);
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  const passwordsMatch =
    user && (await bcrypt.compare(plaintextPw, user.password));

  if (!passwordsMatch) {
    res.status(401).json({
      message:
        "Password received does not match stored value. Please check your password and try again.",
    });
  }

  const accessToken = generateToken(user.id, "15m", "access");
  const refreshToken = generateToken(user.id, "7d", "refresh");

  res.cookie("access-token", accessToken, {
    maxAge: 15 * 60 * 1000, // 15 min
    sameSite: "none",
    secure: true,
    httpOnly: true,
  });
  res.cookie("refresh_token", refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    sameSite: "none",
    secure: true,
    httpOnly: true,
  });

  // add the refresh token to the DB
  user.update({
    data: {
      refreshToken: refreshToken + accessToken,
    },
  });
  next();
};
