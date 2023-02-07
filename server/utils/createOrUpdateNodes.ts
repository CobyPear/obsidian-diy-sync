import type { Node, Vault } from "@prisma/client";
import { prisma } from "../db";

export const createOrUpdateNodes = async ({
  nodes,
  vaultId,
}: {
  nodes: Node[];
  vaultId: Vault["id"];
}) => {
  for (const {
    content,
    name,
    extension,
    path,
    ctime,
    mtime,
  } of nodes) {
    const data = {
      content,
      name,
      extension,
      path,
      ctime,
      mtime,
    };

    try {
      await prisma.node.upsert({
        where: {
          path: path,
        },
        create: {
          ...data,
          vaultId,
        },
        update: {
          ...data,
          vaultId,
        },
      });
    } catch (error) {
      return;
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
