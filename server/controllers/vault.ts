import { prisma } from "../db";
import type { Request, Response } from "express";

export const vaultControllers = {
  get: async (req: Request, res: Response) => {
    // get vault from DB
    // send it!
    const vault = req.query.vault;

    const vaultsFromDB = await prisma.vault.findMany();
    console.log(vaultsFromDB);
    if (!(vaultsFromDB.length < 2)) {
      res.json(vaultsFromDB);
    }
    res.status(400).json({ error: "No vault available to send" });
  },
  put: async (req: Request, res: Response) => {
    const {
      body: { nodes, vault },
    } = req;
    console.log("nodes, vault", nodes, vault);
    if (nodes && vault) {
      const newVault = await prisma.vault.create({
        data: {
          name: vault,
        },
      });
      for (const { content, name, extension, path } of nodes) {
        await prisma.node.create({
          data: {
            Vault: {
              connect: { id: newVault.id },
            },
            content: content,
            name: name,
            extension: extension,
            path: path,
          },
        });
      }
      console.log("newVault", newVault);
      res.json({ message: "success" });
    } else {
      res.status(400).json({ error: "No vault was received" });
    }
  },
};
