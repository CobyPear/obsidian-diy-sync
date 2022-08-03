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
			// TODO: This is coming through as a string. Need to parse it back into markdown, or save it in the DB differently
			vault.create(path.join(vaultPath, node.path), node.content, {
				ctime: Number(node.ctime),
				mtime: Number(node.mtime),
			});
			console.log(`Wrote file ${node.name} at ${node.path}`);
			// Swallow the error
			// eslint-disable-next-line no-empty
		} catch (error) {}
	}
};
