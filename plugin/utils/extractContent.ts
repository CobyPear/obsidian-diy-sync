import type { TFile } from 'obsidian';

export const extractContent = async (file: TFile) => {
	try {
		const data = await file.vault.read(file);
		return data;
	} catch (err) {
		return new Error(`Cannot read file ${file.path} - ${err}`);
	}
};
