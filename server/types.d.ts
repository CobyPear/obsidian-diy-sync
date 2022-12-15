import { JwtPayload } from "jsonwebtoken";
import { User } from "@prisma/client";

interface ReqUser extends JwtPayload {
  userId: typeof User['id'];
  username: string;
}
declare global {
  namespace Express {
    export interface Request {
      user?: ReqUser;
    }
  }
}
