function htmlEscape (text) {
	return text.replace(/[&<>'"]/, text => {
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
		if (!data[item]) {
			return item;
		}

		item = data[item];

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

export { template };

