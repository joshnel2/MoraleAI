export function initializeChatbot(io) {
    io.on('connection', (socket) => {
        socket.on('chat:message', async (payload) => {
            const response = await naiveResponder(payload.message);
            socket.emit('chat:reply', { message: response });
        });
    });
}
async function naiveResponder(input) {
    // Placeholder: In production, call a lightweight HF pipeline or a hosted model
    if (!input)
        return 'Hello! How are you feeling today?';
    if (/stress|stressed/i.test(input))
        return 'Thanks for sharing. On a 1-10 scale, how stressed are you today?';
    if (/happy|happiness/i.test(input))
        return 'Great to hear! On a 1-10 scale, how happy are you today?';
    return 'Noted. What feels right and what feels wrong in the business right now?';
}
//# sourceMappingURL=chatbot.js.map