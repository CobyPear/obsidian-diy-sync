import type { Request, Response } from "express";
import { prisma } from "../db";

export const logoutControllers = {
  post: async (req: Request, res: Response) => {
    const { username } = req.body;
    try {
      await prisma.user.update({
        where: {
          username: username,
        },
        data: {
          refreshToken: "",
        },
      });
    } catch (error) {
      return res.status(404).json({
        message: `Could not find ${username} in database.`,
        prismaError: error,
      });
    }

    console.log(`logging out ${username}...`);

    res.clearCookie("access_token", {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    });
    res.clearCookie("refresh_token", {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    });

    return res.json({ message: `Logged out ${username} successfully!` });
  },
};
