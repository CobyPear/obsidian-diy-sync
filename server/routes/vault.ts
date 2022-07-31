import { Router } from "express";
import { vaultControllers } from "../controllers";

const router = Router();

router.route("/vault").get(vaultControllers.get).put(vaultControllers.put);

export const vaultRoutes = router;
