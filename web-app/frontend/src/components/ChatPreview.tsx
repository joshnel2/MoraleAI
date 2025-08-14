import React, { useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000';

interface ChatMessage {
	who: 'you' | 'assistant' | 'system';
	text: string;
}

export default function ChatPreview() {
	const [messages, setMessages] = useState<ChatMessage[]>([{ who: 'system', text: 'Connected to chatbot preview.' }]);
	const [input, setInput] = useState('');
	const socketRef = useRef<Socket | null>(null);

	const socket = useMemo(() => io(API_BASE, { autoConnect: false }), []);

	useEffect(() => {
		socketRef.current = socket;
		socket.connect();
		socket.on('connect', () => setMessages((m) => [...m, { who: 'system', text: 'Socket connected.' }]));
		socket.on('disconnect', () => setMessages((m) => [...m, { who: 'system', text: 'Socket disconnected.' }]));
		socket.on('chat:reply', (payload: { message: string }) => {
			setMessages((m) => [...m, { who: 'assistant', text: payload?.message ?? '' }]);
		});
		return () => {
			socket.removeAllListeners();
			socket.disconnect();
		};
	}, [socket]);

	function send() {
		const text = input.trim();
		if (!text) return;
		setMessages((m) => [...m, { who: 'you', text }]);
		socketRef.current?.emit('chat:message', { message: text });
		setInput('');
	}

	return (
		<div>
			<div className="border h-56 overflow-auto p-2 rounded bg-white">
				{messages.map((m, i) => (
					<p key={i} className={m.who === 'you' ? 'text-blue-700' : m.who === 'assistant' ? 'text-green-700' : 'text-gray-500'}>
						<strong>{m.who}:</strong> {m.text}
					</p>
				))}
			</div>
			<div className="mt-2 flex gap-2">
				<input className="flex-1 border rounded px-2 py-1" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message" />
				<button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={send}>Send</button>
			</div>
		</div>
	);
}