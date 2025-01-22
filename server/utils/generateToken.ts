import { db } from '../db/index';
import jwt from 'jsonwebtoken';
import type { ReqUser } from '../types';

type TokenType = 'access' | 'refresh';

export const generateToken = async (
	userId: ReqUser['userId'],
	username: ReqUser['username'],
	expiresIn: string,
	type: TokenType,
) => {
	const token = jwt.sign(
		{ userId, username },
		// JWT_REFRESH_TOKEN || JWT_ACCESS_TOKEN
		process.env[`JWT_${type.toUpperCase()}_SECRET`] as string,
		{
			expiresIn: expiresIn,
		},
	);

	// if refresh token, save it to the DB in user.refreshToken
	if (type === 'refresh') {
		const userStmnt = db.prepare(`
UPDATE User
  SET refreshToken = @refreshToken
  WHERE id = @userId
`);
		userStmnt.run({
			userId,
			refreshToken: token,
		});
	}

	return token;
};
