import { Router } from 'express'
import { vaultRoutes} from './vault'

export const router = Router()

router.use(vaultRoutes)

export const routes = router;
