import { Router } from "express";
import { logoutControlers } from "../controllers";
const router = Router();

router.route("/logout").post(logoutControlers.post);

export const logoutRoutes = router;
