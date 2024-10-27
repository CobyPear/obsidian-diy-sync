import type { Vault } from 'obsidian';
import { Node } from '../types';
import path from 'path';
export const writeNodeToFile = async (
	node: Node,
	vaultName: string,
	vault: Vault,
) => {
	const currentVault = vault.getName();

	if (vaultName !== currentVault) {
		// We don't want to create a new vault for the user, instead make sure they start in the
		// same dir as the vault they are trying to fetch
		throw new Error(
			`${vaultName} does not match the current vault, ${currentVault}\nIf you'd like to use ${vaultName}, switch to that vault and try again.`,
		);
	}

	const vaultPath = path.resolve(vault.getRoot().path);
	const nodePath = path.resolve(vaultPath, node.path);
	// If the file doesn't already exist, write it!
	const fileExists = await vault.adapter.exists(nodePath);

	if (!fileExists) {
		const dirs = nodePath
			.split('/')
			.filter((dir) => !dir.endsWith('.md') && dir !== '');

		dirs.length && (await vault.adapter.mkdir(path.join(vaultPath, ...dirs)));
		try {
			const file = await vault.create(path.join(vaultPath, node.path), '', {
				ctime: Number(node.ctime),
				mtime: Number(node.mtime),
			});
			console.log(`Created file ${node.name} at ${node.path}`);
			if (file) {
				// break the content up and put it back in line by line
				const multiLineContent = node.content.split('\n');
				multiLineContent.forEach(
					async (line) => await vault.append(file, `${line}\n`),
				);
				console.log(`Wrote file ${node.name} at ${node.path}`);
			}
			// Swallow the error?
			// eslint-disable-next-line no-empty
		} catch (error) {
			console.error(error);
		}
	}
};
