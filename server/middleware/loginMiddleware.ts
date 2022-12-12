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
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (!user) {
    return res.status(401).json({
      message: `Username ${username} was not found in the database\nIf you are sure the user exists, check the username and try again.`,
    });
  }

  const passwordsMatch =
    user && (await bcrypt.compare(plaintextPw, user.password));

  if (!passwordsMatch) {
    return res.status(401).json({
      message:
        "Password received does not match stored value. Please check your password and try again.",
    });
  }

  if (user && user.id && passwordsMatch) {
    const accessToken = await generateToken(
      user.id,
      user.username,
      "15m",
      "access"
    );
    const refreshToken = await generateToken(
      user.id,
      user.username,
      "7d",
      "refresh"
    );

    res.cookie("access_token", accessToken, {
      maxAge: 15 * 60 * 1000, // 15 min
      sameSite: "none",
      secure: process.env.TEST_ENV === "true" ? false : true,
      httpOnly: true,
    });
    res.cookie("refresh_token", refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      sameSite: "none",
      secure: process.env.TEST_ENV === "true" ? false : true,
      httpOnly: true,
    });

    next();
  }
};
