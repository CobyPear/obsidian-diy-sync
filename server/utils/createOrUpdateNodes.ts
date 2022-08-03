import type { Node, Vault } from "@prisma/client";
import { prisma } from "../db";

export const createOrUpdateNodes = async (
  nodes: Node[],
  vaultId: Vault["id"],
  create = false
) => {
  for (const { content, name, extension, path, ctime, mtime } of nodes) {
    const data = {
      content: content,
      name: name,
      extension: extension,
      path: path,
      ctime: ctime,
      mtime: mtime
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
