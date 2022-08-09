import { JwtPayload } from "jsonwebtoken";

interface ReqUser extends JwtPayload {
  userId: number;
  username: string;
}
declare global {
  namespace Express {
    export interface Request {
      user: ReqUser;
    }
  }
}
