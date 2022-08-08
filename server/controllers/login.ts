import type { Request, Response } from "express";
export const loginControllers = {
  post: async (req: Request, res: Response) => {
    res.json({ message: "Logged in!" });
  },
};
