import { Request, Response } from "express";
export const vaultControllers = {
    get: (req: Request,res: Response) => {
        // get vault from DB
        // send it!
        res.status(400).json({ error: "No vault was to send"})
    },
    post: (req: Request,res: Response) => {
        console.log(req.body);
        if (req.body) {
            res.json({ message: "success" })
        }
        res.status(400).json({ error: "No vault was received"})
    }
}