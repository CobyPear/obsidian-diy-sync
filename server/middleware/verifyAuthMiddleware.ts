import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ReqUser } from '../types';

export const verifyAuthMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		// get the cookie header
		const cookie = req.get('cookie');
		if (!cookie) {
			res.status(401).json({ message: 'Not Authorized' });
			return;
		}
		// grab the access token from the header
		const matches = /^access_token=(?<accessToken>[\w\D]+);/g.exec(
			cookie as string,
		);
		if (matches && matches.groups) {
			const accessToken = matches.groups.accessToken;

			if (!accessToken) {
				res.status(401).json({ message: 'Not Authorized' });
				return;
			}

			const user = jwt.verify(
				accessToken,
				process.env.JWT_ACCESS_SECRET as string,
			) as ReqUser;
			if (user) {
				req.user = user;
			} else {
				res.status(401).json({ message: 'Not Authorized' });
				return;
			}
			next();
		} else {
			// if we're reaching this point it's likely the access_token is expired.
			// Does it make sense to make the refresh endpoint a middleware instead
			// and call next() here instead? Then we could send 401 only if
			// the refresh token is expired
			res.status(401).json({ message: 'Not Authorized' });
			return;
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({
			error: error,
		});
		return;
	}
};
