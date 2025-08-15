import { io } from 'socket.io-client';

const chatEl = document.getElementById('chat');
const inputEl = document.getElementById('message');
const sendBtn = document.getElementById('send');
const consentEl = document.getElementById('consent');
const emailEl = document.getElementById('email');
const passwordEl = document.getElementById('password');
const loginBtn = document.getElementById('login');

let socket;
let token = null;

function append(text, who) {
	const p = document.createElement('p');
	p.textContent = `${who}: ${text}`;
	chatEl.appendChild(p);
	chatEl.scrollTop = chatEl.scrollHeight;
}

async function login() {
	try {
		const res = await fetch('http://localhost:4000/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: emailEl.value, password: passwordEl.value }) });
		if (res.ok) {
			const data = await res.json();
			token = data.token;
			append('Logged in.', 'system');
			connect();
		} else {
			append('Login failed.', 'system');
		}
	} catch {
		append('Login error.', 'system');
	}
}

function connect() {
	if (!token) return append('Please login first.', 'system');
	if (socket) socket.disconnect();
	socket = io('http://localhost:4000', { auth: { token } });
	socket.on('connect', () => append('Connected.', 'system'));
	socket.on('chat:reply', (payload) => append(payload?.message || '', 'assistant'));
	socket.on('disconnect', () => append('Disconnected.', 'system'));
}

sendBtn.addEventListener('click', () => {
	const msg = inputEl.value.trim();
	if (!msg) return;
	if (!token) return append('Please login first.', 'system');
	if (!consentEl.checked) {
		append('Please provide consent before chatting.', 'system');
		return;
	}
	append(msg, 'you');
	try { socket?.emit('chat:message', { message: msg }); } catch {}
	inputEl.value = '';
});

loginBtn.addEventListener('click', login);