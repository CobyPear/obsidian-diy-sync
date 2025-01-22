import type { Request, Response } from 'express';
import type { User } from '../types';
import { db } from '../db';
import { generateToken } from '../utils/generateToken';
import jwt from 'jsonwebtoken';

export const refreshControllers = {
	post: async (req: Request, res: Response) => {
		const { username } = req.body;
		// TODO: Make this composable :eyes:
		const cookie = req.get('cookie');
		const matches = /refresh_token=(?<refreshToken>[\w\D]+);?/g.exec(
			cookie as string,
		);

		if (!matches) {
			return res
				.status(401)
				.json({ message: 'Session expired. Please log in again.' });
		}

		if (matches && matches.groups) {
			const refreshToken = matches.groups.refreshToken;
			try {
				const stmnt = db.prepare<unknown[], User>(`
SELECT id, username, refreshToken
  FROM User
  WHERE username = @username;
`);
				const user = stmnt.get({
					username,
				});
				// const user = await prisma.user.findUnique({
				// 	where: {
				// 		username: username,
				// 	},
				// 	select: {
				// 		id: true,
				// 		username: true,
				// 		refreshToken: true,
				// 	},
				// });
				if (user?.refreshToken === refreshToken) {
					const isValid = jwt.verify(
						refreshToken,
						process.env.JWT_REFRESH_SECRET as string,
					);
					if (isValid) {
						const newAccessToken = await generateToken(
							user.id,
							user.username,
							'15m',
							'access',
						);
						const newRefreshToken = await generateToken(
							user.id,
							user.username,
							'7d',
							'refresh',
						);

						res.cookie('access_token', newAccessToken, {
							maxAge: 15 * 60 * 1000, // 15 min
							sameSite: 'none',
							secure: true,
							httpOnly: true,
						});
						res.cookie('refresh_token', newRefreshToken, {
							maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
							sameSite: 'none',
							secure: true,
							httpOnly: true,
						});

						return res.json({ message: 'Tokens Refreshed' });
					}
				}
			} catch (error) {
				console.log(error);
				return res.status(500).json();
			}
		}
	},
};
