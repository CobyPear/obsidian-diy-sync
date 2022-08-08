import { Router } from "express";
import { vaultRoutes } from "./vault";
import { loginRoutes } from "./login";
import { userRoutes } from "./user";

export const router = Router();

router.use(vaultRoutes, loginRoutes, userRoutes);

export const routes = router;
