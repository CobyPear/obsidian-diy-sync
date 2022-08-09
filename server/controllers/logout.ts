import type { Request, Response } from "express";
import { prisma } from "../db";

export const logoutControlers = {
  post: async (req: Request, res: Response) => {
    console.log(req.body)
    const { username } = req.body;
    console.log(`logging out ${username}...`);
    prisma.user.update({
      where: {
        username: username,
      },
      data: {
        refreshToken: "",
      },
    });

    console.log(req.cookies)

    // req.cookies().clearCookie("access_token", {
    //   sameSite: "none",
    //   secure: true,
    //   httpOnly: true,
    //   path: "/",
    // });
    // req.cookies.clearCookie("refresh_token", {
    //   sameSite: "none",
    //   secure: true,
    //   httpOnly: true,
    //   path: "/",
    // });

    res.clearCookie("access_token", {
      sameSite: "none",
      secure: true,
      httpOnly: true,
      path: "/admin",
    });
    res.clearCookie("refresh_token", {
      sameSite: "none",
      secure: true,
      httpOnly: true,
      path: "/admin",
    });

    // res.cookie("access_token", "", {
    //   expires: yesterday,
    //   httpOnly: true,
    // });

    // res.cookie("refresh_token", "", {
    //   expires: yesterday,
    //   httpOnly: true
    // });

    res.json({ message: `Logged out ${username} successfully!` });
  },
};
