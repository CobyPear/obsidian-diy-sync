import { prisma } from "../db";
import type { Request, Response } from "express";
import { createOrUpdateNodes } from "../utils/createOrUpdateNodes";

export const vaultControllers = {
  get: async (req: Request, res: Response) => {
    const vault = req.query.vault as string;
    console.log("vault", vault);
    const errorMessage = `No vault ${vault} to send. Check the vault name and make sure you've sync'd at least once.`;
    try {
      // get vault from DB
      // send it!
      const [vaultsFromDB] = await prisma.vault.findMany({
        where: { name: vault },
        include: { nodes: true },
      });
      console.log("vaultsFromDb", vaultsFromDB);
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

        if (foundVault) {
          console.log(`Found vault ${vault} Adding nodes...`);
          resultVault =
            foundVault.nodes.length === 0
              ? // create the nodes if there are none!
                await createOrUpdateNodes(nodes, foundVault.id, true)
              : // else, update them
                await createOrUpdateNodes(nodes, foundVault.id);
        } else {
          const newVault = await prisma.vault.create({
            data: {
              name: vault,
              userId: req.user.userId,
            },
          });
          resultVault = await createOrUpdateNodes(nodes, newVault.id, true);
        }
        res.json({ message: "success", vault: resultVault });
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
