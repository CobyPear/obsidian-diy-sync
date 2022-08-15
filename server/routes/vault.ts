import { Router } from "express";
import { vaultControllers } from "../controllers";
import { verifyAuthMiddleware } from "../middleware/verifyAuthMiddleware";
const router = Router();

router
  .route("/vault")
  .get(verifyAuthMiddleware, vaultControllers.get)
  .put(verifyAuthMiddleware, vaultControllers.put);

export const vaultRoutes = router;
