import type { Vault } from "obsidian";
import { Node } from "../types";
import path from "path";
export const writeNodeToFile = async (
  node: Node,
  vaultName: string,
  vault: Vault
) => {
  const currentVault = vault.getName();
  if (vaultName !== currentVault) {
    // We don't want to create a new vault for the user, instead make sure they start in the
    // same dir as the vault they are trying to fetch
    throw new Error(
      `${vaultName} does not match the current vault, ${currentVault}\nIf you'd like to use ${vaultName}, switch to that vault and try again.`
    );
  }

  const vaultPath = path.join(process.cwd(), vault.getRoot().path);
  // If the file doesn't already exist, write it!
  if (!vault.getAbstractFileByPath(path.join(vaultPath, node.path))) {
    try {
      const file = await vault.create(path.join(vaultPath, node.path), "", {
        ctime: Number(node.ctime),
        mtime: Number(node.mtime),
      });
      console.log(`Wrote file ${node.name} at ${node.path}`);
      if (file) {
        // break the content up and put it back in line by line
        const multiLineContent = node.content.split("\n");
        multiLineContent.forEach(
          async (line) => await vault.append(file, `${line}\n`)
        );
      }
      // Swallow the error?
      // eslint-disable-next-line no-empty
    } catch (error) {}
  }
};
