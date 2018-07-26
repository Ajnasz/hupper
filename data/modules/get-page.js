import DOMpurify from 'dompurify';

function createDocument (text) {
	const lines = text.split('\n');
	const mainStart = lines.findIndex(l =>
		l.includes('<!-- start main content -->'));
	const mainEnd = lines.findIndex(l =>
		l.includes('<!-- end main content -->'));

	const content = lines.slice(mainStart, mainEnd + 1).filter(l => !l.includes('<script') && !l.includes('</script>')).join('\n');
	const fragment = document.createElement('div');
	fragment.innerHTML = DOMpurify.sanitize(content);
	return fragment;
}

function getPage (url) {
	return fetch(url, { credentials: 'same-origin' })
		.then(response => response.text())
		.then(createDocument);
}

export default getPage;
