const chatEl = document.getElementById('chat');
const inputEl = document.getElementById('message');
const sendBtn = document.getElementById('send');
const consentEl = document.getElementById('consent');

let socket;

function append(text, who) {
	const p = document.createElement('p');
	p.textContent = `${who}: ${text}`;
	chatEl.appendChild(p);
	chatEl.scrollTop = chatEl.scrollHeight;
}

function connect() {
	if (socket) socket.close();
	// Basic WebSocket example — in production use an endpoint that bridges to Socket.io or native ws
	socket = new WebSocket('ws://localhost:4000');
	socket.onopen = () => append('Connected.', 'system');
	socket.onmessage = (evt) => append(evt.data, 'assistant');
	socket.onclose = () => append('Disconnected.', 'system');
	socket.onerror = () => append('Error.', 'system');
}

sendBtn.addEventListener('click', () => {
	const msg = inputEl.value.trim();
	if (!msg) return;
	if (!consentEl.checked) {
		append('Please provide consent before chatting.', 'system');
		return;
	}
	append(msg, 'you');
	try {
		socket?.send(msg);
	} catch {}
	inputEl.value = '';
});

connect();