export const LOCALE =
	process.env.LOCALE ||
	(process.env.LANG?.split('.')[0].replace('_', '-') ?? '');
