import { Router } from "express";
import { userControllers } from "../controllers";

const router = Router();

router.route("/user").post(userControllers.post);

export const userRoutes = router;
