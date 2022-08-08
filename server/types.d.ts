import { JwtPayload } from "jsonwebtoken";

interface ReqUser extends JwtPayload {
  userId: number;
}
declare global {
  namespace Express {
    export interface Request {
      user: ReqUser;
    }
  }
}
