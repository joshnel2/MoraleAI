(function() {
	const banner = document.createElement('div');
	banner.textContent = 'AI-PBT chatbot available for authenticated employees';
	banner.style.position = 'fixed';
	banner.style.bottom = '8px';
	banner.style.right = '8px';
	banner.style.background = '#111';
	banner.style.color = '#fff';
	banner.style.padding = '6px 8px';
	banner.style.zIndex = '999999';
	document.body.appendChild(banner);
	setTimeout(() => banner.remove(), 5000);
})();