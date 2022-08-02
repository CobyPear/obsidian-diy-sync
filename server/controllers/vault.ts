import type { Node, Vault } from "@prisma/client";
import { prisma } from "../db";
import type { Request, Response } from "express";

const createOrUpdateNodes = async (
  nodes: Node[],
  vaultId: Vault["id"],
  create = false
) => {
  for (const { content, name, extension, path } of nodes) {
    const data = {
      content: content,
      name: name,
      extension: extension,
      path: path,
    };
    if (create) {
      await prisma.node.create({
        data: {
          Vault: {
            connect: { id: vaultId },
          },
          ...data,
        },
      });
    } else {
      await prisma.node.updateMany({
        where: {
          name: name,
        },
        data: {
          ...data,
        },
      });
    }
  }
  return await prisma.vault.findUnique({
    where: {
      id: vaultId,
    },
    include: {
      nodes: true,
    },
  });
};

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
        console.log("Found vault. Adding nodes...");
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
