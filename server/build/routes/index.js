"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = exports.router = void 0;
const express_1 = require("express");
const vault_1 = require("./vault");
exports.router = (0, express_1.Router)();
exports.router.use(vault_1.vaultRoutes);
exports.routes = exports.router;
