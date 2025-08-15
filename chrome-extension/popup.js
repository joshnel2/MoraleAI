const chatEl = document.getElementById('chat');
const inputEl = document.getElementById('message');
const sendBtn = document.getElementById('send');
const consentEl = document.getElementById('consent');

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
		const res = await fetch('http://localhost:4000/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@example.com', password: 'examplePass123' }) });
		if (res.ok) {
			const data = await res.json();
			token = data.token;
		}
	} catch {}
}

function connect() {
	if (socket) socket.disconnect();
	// socket.io client via CDN
	const io = window.io;
	socket = io('http://localhost:4000', { auth: { token } });
	socket.on('connect', () => append('Connected.', 'system'));
	socket.on('chat:reply', (payload) => append(payload?.message || '', 'assistant'));
	socket.on('disconnect', () => append('Disconnected.', 'system'));
}

sendBtn.addEventListener('click', () => {
	const msg = inputEl.value.trim();
	if (!msg) return;
	if (!consentEl.checked) {
		append('Please provide consent before chatting.', 'system');
		return;
	}
	append(msg, 'you');
	try { socket?.emit('chat:message', { message: msg }); } catch {}
	inputEl.value = '';
});

(async () => {
	await login();
	// load socket.io client
	const s = document.createElement('script');
	s.src = 'https://cdn.socket.io/4.7.5/socket.io.min.js';
	s.onload = connect;
	document.body.appendChild(s);
})();