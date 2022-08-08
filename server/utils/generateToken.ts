import jwt from "jsonwebtoken";

export const generateToken = (username: string) => {
  return jwt.sign(username, process.env.JWT_SECRET as string, {
    expiresIn: "1800s",
  });
};
