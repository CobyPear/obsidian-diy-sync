import type { Request, Response } from 'express';
import { orm } from '../db/orm';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/generateToken';
import { clearCookies } from '../utils/clearCookies';
import { randomUUID } from 'node:crypto';

const saltRounds = 10;
export const userControllers = {
	// create a user
	post: async (req: Request, res: Response) => {
		const { username, password: plaintextPw, secret } = req.body;
		if (process.env.CLIENT_SECRET !== secret) {
			res.status(403).json({
				message:
					'Invalid client secret. If you are a valid user of the server, ask the owner for the client secret',
			});
			return;
		}
		// salt and hash pw
		try {
			const hashedPw = await bcrypt.hash(plaintextPw, saltRounds);
			// create new user
			const newUserStmnt = orm.createUser();

			const userId = randomUUID();
			newUserStmnt.run({
				id: userId,
				username,
				password: hashedPw,
			});

			const accessToken = await generateToken(
				userId,
				username,
				'15m',
				'access',
			);
			const refreshToken = await generateToken(
				userId,
				username,
				'7d',
				'refresh',
			);

			if (accessToken && refreshToken) {
				res.cookie('access_token', accessToken, {
					maxAge: 15 * 60 * 1000, // 15 min
					sameSite: 'none',
					secure: process.env.TEST_ENV === 'true' ? false : true,
					httpOnly: true,
				});
				res.cookie('refresh_token', refreshToken, {
					maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
					sameSite: 'none',
					secure: process.env.TEST_ENV === 'true' ? false : true,
					httpOnly: true,
				});
				// send response to user
				res.json({
					message: 'User created!',
					username: username,
				});
			}
		} catch (error) {
			if (error) {
				console.error(error);
				res.status(400).json({
					message: 'Could not create user. Is the username already in use?',
					error: error,
				});
			} else {
				console.error(error);
				// if error, send error
				res.status(500).json({ error: error });
			}
		}
	},
	delete: async (req: Request, res: Response) => {
		console.log(req.user);
		if (!req.user) {
			res.status(401).json({
				message: 'Please log in to the user account that needs to be deleted',
			});
			return;
		}
		try {
			const username = req.user.username;

			const deletedUserStmnt = orm.deleteUser();
			const deleted = deletedUserStmnt.run({
				username,
			});

			if (deleted) {
				clearCookies(res);
				delete req.user;

				res.status(200).json({
					message: `${username} and associated vault(s) deleted successfully`,
				});
				return;
			} else {
				res
					.status(404)
					.json({ message: 'No user was deleted. Does the user exist?' });
				return;
			}
		} catch (error) {
			console.error(error);
			res.status(500).json();
			return;
		}
	},
};
