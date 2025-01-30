import { db } from '../db/index';
import jwt from 'jsonwebtoken';
import type { ReqUser } from '../types';
import { orm } from '../db/orm';

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
		const userStmnt = orm.updateUser();
		userStmnt.run({
			userId,
			refreshToken: token,
		});
	}

	return token;
};
