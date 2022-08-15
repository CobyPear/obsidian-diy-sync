import type { Request, Response } from "express";
import type { Vault } from "@prisma/client";
import { prisma } from "../db";
import { createOrUpdateNodes } from "../utils/createOrUpdateNodes";

export const vaultControllers = {
  get: async (req: Request, res: Response) => {
    const vault = req.query.vault as string;
    const errorMessage = `No vault ${vault} to send. Check the vault name and make sure you've sync'd at least once.`;
    try {
      // get vault from DB
      // send it!
      const [vaultsFromDB] = await prisma.vault.findMany({
        where: { name: vault },
        include: { nodes: true },
      });
      if (!vaultsFromDB) {
        res.status(404).json({
          error: errorMessage,
        });
      }
      res.json(vaultsFromDB);
    } catch (error) {
      res.status(404).json({
        error: errorMessage,
      });
    }
  },
  put: async (req: Request, res: Response) => {
    try {
      const {
        body: { nodes, vault },
      } = req;
      let resultVault;
      if (!req.user) {
        res.status(401);
      }
      if (nodes && vault) {
        const [foundVault] = await prisma.vault.findMany({
          where: {
            name: vault,
          },
          include: {
            nodes: true,
          },
        });

        let vaultId: Vault["id"];

        if (foundVault) {
          console.log(`Found vault ${vault} Adding nodes...`);
          vaultId = foundVault.id;
          resultVault = await createOrUpdateNodes({
            nodes,
            vaultId: foundVault.id,
          });
        } else {
          const newVault = await prisma.vault.create({
            data: {
              name: vault,
              userId: req.user.userId,
            },
          });
          vaultId = newVault.id;
        }
        resultVault = await createOrUpdateNodes({
          nodes,
          vaultId: vaultId,
        });
        ``;
        res.json({
          message: `Vault ${vault} was successfuly sync'd!`,
          vault: resultVault,
        });
      } else {
        res.status(400).json({ error: "No vault was received" });
      }
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong",
        error: error,
      });
    }
  },
};
