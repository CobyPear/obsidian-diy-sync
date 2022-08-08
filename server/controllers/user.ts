import type { Request, Response } from "express";
import { prisma } from "../db/index";
import bcrypt from "bcrypt";
const saltRounds = 10;
// TODO: need a way to create a user from an API route (or do i?)
export const userControllers = {
  // create a user
  post: async (req: Request, res: Response) => {
    const { username, password: plaintextPw } = req.body;
    console.log("uname,pwd", username, plaintextPw);
    // salt and hash pw
    try {
      const hashedPw = await bcrypt.hash(plaintextPw, saltRounds);
      console.log("hashed pass", hashedPw);
      // create new user
      const newUser = await prisma.user.create({
        data: {
          username,
          password: hashedPw,
        },
      });

      // send response to user
      res.json({
        message: "User created!",
        user: {
          id: newUser.id,
          username: newUser.username,
        },
      });
    } catch (error) {
      // if error, send error
      console.error(error);
    }
  },
};
