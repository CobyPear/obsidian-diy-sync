import { Router } from "express";
import { vaultRoutes } from "./vault";
import { loginRoutes } from "./login";
import { userRoutes } from "./user";
import { refreshRoutes } from "./refreshToken";
import { logoutRoutes } from "./logout";

export const router = Router();

router.use(vaultRoutes, loginRoutes, userRoutes, refreshRoutes, logoutRoutes);

export const routes = router;
