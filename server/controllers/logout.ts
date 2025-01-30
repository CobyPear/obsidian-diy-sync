import type { Request, Response } from 'express';
import { orm } from '../db/orm';
import { clearCookies } from '../utils/clearCookies';

export const logoutControllers = {
	post: async (req: Request, res: Response) => {
		const { username } = req.body;
		try {
			const stmnt = orm.updateUser();
			const user = stmnt.run({
				refreshToken: '',
				username,
			});

			if (!user.changes) {
				throw new Error('user not found');
			}
		} catch (error) {
			res.status(404).json({
				message: `Could not find ${username} in database.`,
				error: error,
			});
			return;
		}

		console.log(`logging out ${username}...`);
		clearCookies(res);
		delete req.user;

		res.json({ message: `Logged out ${username} successfully!` });
		return;
	},
};
