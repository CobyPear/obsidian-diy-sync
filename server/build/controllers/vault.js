"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vaultControllers = void 0;
exports.vaultControllers = {
    get: (req, res) => {
        // get vault from DB
        // send it!
        res.status(400).json({ error: "No vault was to send" });
    },
    post: (req, res) => {
        console.log(req.body);
        if (req.body) {
            res.json({ message: "success" });
        }
        res.status(400).json({ error: "No vault was received" });
    }
};
