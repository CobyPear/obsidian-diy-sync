import { JwtPayload } from 'jsonwebtoken';

interface User {
	id: string;
	username: string;
	password: string;
	refreshToken?: string;
}

interface Vault {
	id: string;
	createdAt: Date;
	name: User['username'];
	user: string;
	nodes: Node[];
}

interface Node {
	id: string;
	vaultId: Vault['id'];
	name: string;
	path: string;
	content: string;
	extension: string;
	ctime: string;
	mtime: string;
}

interface ReqUser extends JwtPayload {
	userId: (typeof User)['id'];
	username: string;
}
declare global {
	namespace Express {
		export interface Request {
			user?: ReqUser;
		}
	}
}
