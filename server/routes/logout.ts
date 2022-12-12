import { Router } from "express";
import { logoutControllers } from "../controllers";
const router = Router();

router.route("/logout").post(logoutControllers.post);

export const logoutRoutes = router;
