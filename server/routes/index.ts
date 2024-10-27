import { Router } from 'express';

import { userControllers } from '../controllers';
import { loginControllers } from '../controllers';
import { logoutControllers } from '../controllers';
import { refreshControllers } from '../controllers';
import { vaultControllers } from '../controllers';

import { loginMiddleware } from '../middleware/loginMiddleware';
import { verifyAuthMiddleware } from '../middleware/verifyAuthMiddleware';

const router = Router();

router
	.route('/user')
	.post(userControllers.post)
	.delete(verifyAuthMiddleware, userControllers.delete);
router.route('/login').post(loginMiddleware, loginControllers.post);
router.route('/logout').post(logoutControllers.post);
router.route('/refresh_token').post(refreshControllers.post);
router
	.route('/vault')
	.get(verifyAuthMiddleware, vaultControllers.get)
	.put(verifyAuthMiddleware, vaultControllers.put);

export const routes = router;
