import type { Request, Response } from "express";
import { prisma } from "../db/index";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { clearCookies } from "../utils/clearCookies";

const saltRounds = 10;
// TODO: need a way to create a user from an API route (or do i?)
export const userControllers = {
  // create a user
  post: async (req: Request, res: Response) => {
    const { username, password: plaintextPw, secret } = req.body;
    if (process.env.CLIENT_SECRET !== secret) {
      return res.status(403).json({
        message:
          "Invalid client secret. If you are a valid user of the server, ask the owner for the client secret",
      });
    }
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
          secure: process.env.TEST_ENV === "true" ? false : true,
          httpOnly: true,
        });
        res.cookie("refresh_token", refreshToken, {
          maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
          sameSite: "none",
          secure: process.env.TEST_ENV === "true" ? false : true,
          httpOnly: true,
        });
        // send response to user
        res.json({
          message: "User created!",
          username: newUser.username,
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
  delete: async (req: Request, res: Response) => {
    console.log(req.user);
    if (!req.user) {
      return res.status(401).json({
        message: "Please log in to the user account that needs to be deleted",
      });
    }
    try {
      const username = req.user.username;

      const deleted = await prisma.user.delete({
        where: {
          username,
        },
      });
      if (deleted) {
        clearCookies(res);
        delete req.user;

        return res.status(200).json({
          message: `${username} and associated vault(s) deleted successfully`,
        });
      } else {
        return res
          .status(404)
          .json({ message: "No user was deleted. Does the user exist?" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json();
    }
  },
};
