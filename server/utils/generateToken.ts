import { prisma } from "../db/index";
import jwt from "jsonwebtoken";
import type { ReqUser } from "../types";

type TokenType = "access" | "refresh";

export const generateToken = async (
  userId: ReqUser['userId'],
  username: ReqUser['username'],
  expiresIn: string,
  type: TokenType
) => {
  const token = jwt.sign(
    { userId, username },
    // JWT_REFRESH_TOKEN || JWT_ACCESS_TOKEN
    process.env[`JWT_${type.toUpperCase()}_SECRET`] as string,
    {
      expiresIn: expiresIn,
    }
  );

  // if refresh token, save it to the DB in prisma.user.refreshToken
  if (type === "refresh") {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: token,
      },
    });
  }

  return token;
};
