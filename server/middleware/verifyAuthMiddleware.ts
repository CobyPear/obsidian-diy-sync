import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ReqUser } from "../types";

export const verifyAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // get the cookie header
    const cookie = req.get("cookie");
    if (!cookie) return res.status(401).json({ message: "Not Authorized" });
    // grab the access token from the header
    const matches = /^access_token=(?<accessToken>.*);/g.exec(cookie as string);
    if (matches && matches.groups) {
      const accessToken = matches.groups.accessToken;

      if (!accessToken) return res.status(401).json({ message: "Not Authorized" });

      const user = jwt.verify(
        accessToken,
        process.env.JWT_ACCESS_SECRET as string
      ) as ReqUser;
      if (user) {
        req.user = user;
      } else {
        return res.status(401).json({ message: "Not Authorized" });
      }
      next();
    } else {
      // if we're reaching this point it's likely the access_token is expired.
      // Does it make sense to make the refresh endpoint a middleware instead
      // and call next() here instead? Then we could send 401 only if
      // the refresh token is expired
      res.status(401).json({ message: "Not Authorized" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error,
    });
  }
};
