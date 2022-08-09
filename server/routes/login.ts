import { Router } from "express";
import { loginControllers } from "../controllers";
import { loginMiddleware } from "../middleware/loginMiddleware";
const router = Router();

router.route("/login").post(loginMiddleware, loginControllers.post);

export const loginRoutes = router;
