import type { Request, Response } from "express";
// TODO: need a way to create a user from an API route (or do i?)
export const loginControllers = {
  post: (req: Request, res: Response) => {
    const { username, password } = req.body;
    console.log("uname,pwd", username, password);
    // TODO: login the user
  },
};
