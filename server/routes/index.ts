import { Router } from "express";
import { vaultRoutes } from "./vault";
import { loginRoutes } from "./login";

export const router = Router();

router.use(vaultRoutes, loginRoutes);

export const routes = router;
