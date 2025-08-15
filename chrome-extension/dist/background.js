chrome.runtime.onInstalled.addListener(() => {
	console.log('AI-PBT extension installed');
});

// Placeholder: manage auth token in storage
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
	if (msg?.type === 'set-token') {
		chrome.storage.local.set({ token: msg.token }, () => sendResponse({ ok: true }));
		return true;
	}
	if (msg?.type === 'get-token') {
		chrome.storage.local.get('token', (res) => sendResponse(res));
		return true;
	}
});