import type { Vault } from "obsidian";

// remove .DS_Store and .obsidian file from the vault
export const getVaultStructure = async (vault: Vault) => {
  const { files: vaultFiles, folders } = await vault.adapter.list(
    vault.getRoot().path
  );
  const filteredFiles = vaultFiles.filter(
    (x) => !/.DS_Store|.obsidian/.test(x)
  );
  const filteredFolders = folders.filter((x) => !/.DS_Store|.obsidian/.test(x));
  // TODO: pull out nested files from filtered folders to...

  return { filteredFiles, filteredFolders };
};
