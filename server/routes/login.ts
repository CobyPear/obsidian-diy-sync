import { Router } from "express";
import { loginControllers } from "../controllers";
import { authMiddleware } from "../middleware/authMiddleware";
const router = Router();

router.route("/login").post(authMiddleware, loginControllers.post);

export const loginRoutes = router;
