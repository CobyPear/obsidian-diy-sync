import { Router } from "express";
import { vaultControllers } from "../controllers";

const router = Router();

router.route("/vault").get(vaultControllers.get).post(vaultControllers.post);

export const vaultRoutes = router;
