import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export type RequestWithUser = Request & { user: string | JwtPayload };
