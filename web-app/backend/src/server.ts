import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { initializeChatbot } from './chatbot';
import authRoutes from './routes/auth';
import dataRoutes from './routes/data';
import metricsRoutes from './routes/metrics';
import auditRoutes from './routes/audit';
import swaggerUi from 'swagger-ui-express';
import platformRoutes from './routes/platform';
import privacyRoutes from './routes/privacy';
import pricingRoutes from './routes/pricing';

const openApiDoc = {
	openapi: '3.0.0',
	info: { title: 'AI-Profile-Business-Tool API', version: '0.1.0' },
	paths: {
		'/health': { get: { summary: 'Health', responses: { '200': { description: 'OK' } } } }
	}
};

// Basic config
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-pbt';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Express setup
const app = express();
app.use(helmet());
app.use(cors({ origin: '*', credentials: false }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Database
mongoose
	.connect(MONGO_URI)
	.then(() => console.log('MongoDB connected'))
	.catch((err) => {
		console.error('MongoDB connection error', err);
		process.exit(1);
	});

// Routes
app.use('/auth', authRoutes);
app.use('/data', dataRoutes);
app.use('/metrics', metricsRoutes);
app.use('/audit', auditRoutes);
app.use('/platform', platformRoutes);
app.use('/privacy', privacyRoutes);
app.use('/pricing', pricingRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDoc as any));

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

// HTTP + Socket.io
const server = http.createServer(app);
const io = new SocketIOServer(server, {
	cors: { origin: '*', credentials: false }
});

io.use((socket, next) => {
	try {
		const token = socket.handshake.auth?.token || socket.handshake.query?.token;
		if (!token || typeof token !== 'string') return next(new Error('Unauthorized'));
		jwt.verify(token, JWT_SECRET);
		return next();
	} catch {
		return next(new Error('Unauthorized'));
	}
});

initializeChatbot(io);

server.listen(PORT, () => {
	console.log(`API listening on http://localhost:${PORT}`);
});