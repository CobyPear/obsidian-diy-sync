import type { Request, Response } from "express";
import { prisma } from "../db/index";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

const saltRounds = 10;
// TODO: need a way to create a user from an API route (or do i?)
export const userControllers = {
  // create a user
  post: async (req: Request, res: Response) => {
    const { username, password: plaintextPw } = req.body;
    // salt and hash pw
    try {
      const hashedPw = await bcrypt.hash(plaintextPw, saltRounds);
      // create new user
      const newUser = await prisma.user.create({
        data: {
          username,
          password: hashedPw,
        },
      });

      const accessToken = await generateToken(
        newUser.id,
        newUser.username,
        "15m",
        "access"
      );
      const refreshToken = await generateToken(
        newUser.id,
        newUser.username,
        "7d",
        "refresh"
      );

      if (accessToken && refreshToken) {
        res.cookie("access_token", accessToken, {
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

        // send response to user
        res.json({
          message: "User created!",
          user: {
            username: newUser.username,
          },
        });
      }
    } catch (error) {
      if ((error as PrismaClientKnownRequestError).code) {
        res.status(400).json({
          message: "Could not create user. Is the username already in use?",
          prismaError: error,
        });
      } else {
        console.error(error);
        // if error, send error
        res.status(500).json({ prismaError: error });
      }
    }
  },
};
