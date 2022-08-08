import { prisma } from "../db/index";
import jwt from "jsonwebtoken";

type TokenType = "access" | "refresh";

export const generateToken = (
  userId: number,
  expiresIn: string,
  type: TokenType
) => {
  const token = jwt.sign(
    { userId: userId },
    // JWT_REFRESH_TOKEN || JWT_ACCESS_TOKEN
    process.env[`JWT_${type.toUpperCase()}_SECRET`] as string,
    {
      expiresIn: expiresIn,
    }
  );

  // if refresh token, save it to the DB in prisma.user.refreshToken
  if (type === "refresh") {
    prisma.user.update({
      where: {
        id: userId,
      },
      data:  {},
    });
  }

  return token;
};
