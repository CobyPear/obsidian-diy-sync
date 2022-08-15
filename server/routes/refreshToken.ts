import { Router } from "express";
import { refreshControllers } from "../controllers";
const router = Router();

router.route("/refresh_token").post(refreshControllers.post);

export const refreshRoutes = router;
