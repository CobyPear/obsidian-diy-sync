import type { Response } from "express";

export const clearCookies = (res: Response) => {
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
};
