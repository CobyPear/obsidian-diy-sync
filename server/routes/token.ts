import { Router } from "express";
import { userControllers } from "../controllers";

const router = Router();

router.route("/token").post(userControllers.post);

export const tokenRoutes = router;
