import type { Request, Response } from 'express';
import type { User } from '../types';
import { db } from '../db';
import { clearCookies } from '../utils/clearCookies';

export const logoutControllers = {
	post: async (req: Request, res: Response) => {
		const { username } = req.body;
		try {
			const stmnt = db.prepare<unknown[], User>(`
UPDATE User
  SET refreshToken = @refreshToken
  WHERE username = @username;
`);
			stmnt.run({
				refreshToken: '',
				username,
			});
			// await prisma.user.update({
			// 	where: {
			// 		username: username,
			// 	},
			// 	data: {
			// 		refreshToken: '',
			// 	},
			// });
		} catch (error) {
			return res.status(404).json({
				message: `Could not find ${username} in database.`,
				error: error,
			});
		}

		console.log(`logging out ${username}...`);
		clearCookies(res);
		delete req.user;

		return res.json({ message: `Logged out ${username} successfully!` });
	},
};
