import { prisma } from "../db";
import type { Request, Response } from "express";
import { createOrUpdateNodes } from "../utils/createOrUpdateNodes";

export const vaultControllers = {
  get: async (req: Request, res: Response) => {
    // get vault from DB
    // send it!
    const vault = req.query.vault as string;
    const [vaultsFromDB] = await prisma.vault.findMany({
      // where: { name: vault },
      include: { nodes: true },
    });
    console.log(vaultsFromDB);
    if (!vaultsFromDB) {
      res.status(404).json({
        error: `No vault ${vault} to send. Check the vault name and make sure you've sync'd at least once.`,
      });
    }
    res.json(vaultsFromDB);
  },
  put: async (req: Request, res: Response) => {
    const {
      body: { nodes, vault },
    } = req;
    let resultVault;
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
          },
        });
        resultVault = await createOrUpdateNodes(nodes, newVault.id, true);
      }
      res.json({ message: "success", vault: resultVault });
    } else {
      res.status(400).json({ error: "No vault was received" });
    }
  },
};
