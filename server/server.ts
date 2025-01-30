import type { CorsOptions } from 'cors';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { morganMiddleware } from './utils/logger';
import { routes } from './routes';
import { blogControllers } from './controllers/blog';

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;
const host = process.env.HOST || 'localhost';

const corsOptions: CorsOptions = {
	allowedHeaders: ['Origin', 'Content-Type', 'Set-Cookie'],
	methods: 'GET,OPTIONS,POST,PUT,DELETE',
	origin: 'app://obsidian.md',
	credentials: true,
	preflightContinue: true,
};

app.use(express.json({ limit: '250mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);
// ignore cors for blog route for now
app.get('/api/blog', blogControllers.get);
app.use(cors(corsOptions));

app.use('/api', routes);
app.use('*', (req, res) => {
	res.status(404).json({ message: 'Route not found' });
});

app.listen(port, () => {
	console.log(`🌎 Server listening at http://${host}:${port}`);
});

export default app;
