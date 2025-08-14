import type { Server as SocketIOServer, Socket } from 'socket.io';

export function initializeChatbot(io: SocketIOServer) {
	io.on('connection', (socket: Socket) => {
		socket.on('chat:message', async (payload: { message: string }) => {
			const response = await naiveResponder(payload.message);
			socket.emit('chat:reply', { message: response });
		});
	});
}

async function naiveResponder(input: string): Promise<string> {
	// Placeholder: In production, call a lightweight HF pipeline or a hosted model
	if (!input) return 'Hello! How are you feeling today?';
	if (/stress|stressed/i.test(input)) return 'Thanks for sharing. On a 1-10 scale, how stressed are you today?';
	if (/happy|happiness/i.test(input)) return 'Great to hear! On a 1-10 scale, how happy are you today?';
	return 'Noted. What feels right and what feels wrong in the business right now?';
}