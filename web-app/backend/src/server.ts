import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

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

// Types
interface JwtClaims {
	userId: string;
	role: 'admin' | 'ceo' | 'employee';
	companyId: string;
}

// Middleware: auth
function requireAuth(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization;
	if (!authHeader?.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	const token = authHeader.slice('Bearer '.length);
	try {
		const decoded = jwt.verify(token, JWT_SECRET) as JwtClaims;
		(req as any).user = decoded;
		return next();
	} catch {
		return res.status(401).json({ error: 'Invalid token' });
	}
}

// Middleware: consent verification
function requireConsent(req: Request, res: Response, next: NextFunction) {
	const consent = (req.body && req.body.consent) || (req.query && (req.query as any).consent);
	if (!consent || consent.granted !== true) {
		return res.status(400).json({ error: 'Consent not granted' });
	}
	return next();
}

// Routes
app.post('/auth/login', async (req: Request, res: Response) => {
	// Stub login — in real code, validate credentials with DB and bcrypt
	const { username, password } = req.body as { username: string; password: string };
	if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
	// Issue JWT
	const token = jwt.sign(
		{ userId: 'demo-user', role: 'admin', companyId: 'demo-company' } satisfies JwtClaims,
		JWT_SECRET,
		{ expiresIn: '1h' },
	);
	return res.json({ token });
});

app.post('/company/register', requireAuth, async (req: Request, res: Response) => {
	return res.json({ status: 'ok', companyId: 'demo-company' });
});

app.post('/chatbot/deploy', requireAuth, async (req: Request, res: Response) => {
	return res.json({ status: 'deployed', configId: 'demo-config' });
});

app.post('/data/aggregate', requireAuth, requireConsent, async (req: Request, res: Response) => {
	// Accept anonymized chat logs + uploaded metrics references
	return res.json({ status: 'aggregated', datasetId: 'demo-dataset' });
});

app.post('/training/aws/start', requireAuth, async (req: Request, res: Response) => {
	// Stub endpoint to kick off training on AWS (e.g., via Step Functions)
	return res.json({ status: 'started', jobId: 'demo-job' });
});

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

// HTTP + Socket.io
const server = http.createServer(app);
const io = new SocketIOServer(server, {
	cors: { origin: '*', credentials: false }
});

io.on('connection', (socket) => {
	// Authenticate socket via token if needed
	console.log('socket connected', socket.id);
	// Placeholder chatbot room
	socket.on('chat:message', (payload) => {
		// In future: route to NLP handler, store encrypted, emit response
		socket.emit('chat:reply', { message: `Echo: ${payload?.message ?? ''}` });
	});
});

server.listen(PORT, () => {
	console.log(`API listening on http://localhost:${PORT}`);
});