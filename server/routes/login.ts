import { Router } from "express";
import { loginControllers } from "../controllers";
const router = Router();

router.route("/login").post(loginControllers.post);

export const loginRoutes = router;
