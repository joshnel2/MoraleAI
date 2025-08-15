// Placeholder uploader: implement OS-specific app/window tracking and batching
// Suggest: use active-window or node-mac-activity/node-win32 APIs from native modules

setInterval(() => {
	// In production, gather recent events and POST to /platform/agent/ingest
}, 15000);