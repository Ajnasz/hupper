function htmlEscape (text) {
	return text.replace(/[&<>'"]/g, text => {
		let output = text;

		switch (text) {
			case '&':
				output = '&amp;';
				break;
			case '<':
				output = '&lt;';
				break;
			case '>':
				output = '&gt;';
				break;
			case "'":
				output = '&apos;';
				break;
			case '"':
				output = '&quot;';
				break;
		}

		return output;
	});
}

function template (tpl, data) {
	return tpl.replace(/\{(=)?([^}]+)\}/g, (match, prefix, item) => {
		if (!(item in data) || data[item] === null || typeof data[item] === 'undefined') {
			return match;
		}

		item = data[item].toString();

		switch (prefix) {
			case '=':
				break;
			default:
				item = htmlEscape(item);
				break;
		}

		return item;
	});
}

export { template, htmlEscape };

