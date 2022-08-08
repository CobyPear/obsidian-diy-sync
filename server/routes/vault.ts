import { Router } from "express";
import { vaultControllers } from "../controllers";
import { authMiddleware } from "../middleware/authMiddleware";
const router = Router();

router
  .route("/vault")
  .get(authMiddleware, vaultControllers.get)
  .put(authMiddleware, vaultControllers.put);

export const vaultRoutes = router;
