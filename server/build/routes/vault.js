"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vaultRoutes = void 0;
const express_1 = require("express");
const controllers_1 = require("../controllers");
const router = (0, express_1.Router)();
router.route("/vault").get(controllers_1.vaultControllers.get).post(controllers_1.vaultControllers.post);
exports.vaultRoutes = router;
