import { Request, Response } from "express";
export const vaultControllers = {
    get: (req: Request,res: Response) => {
        // get vault from DB
        // send it!
        res.status(400).json({ error: "No vault available to send"})
    },
    put: (req: Request,res: Response) => {
        console.log('req.body',req.body);
        if (req.body) {
            res.json({ message: "success" })
        } else {
            res.status(400).json({ error: "No vault was received"})
        }
    }
}