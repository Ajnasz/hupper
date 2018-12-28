import { times } from '../../core/func';

function createStyle (elements, rules) {
	return elements.join(',') + '{' + rules.map(function (rule) {
		return rule.name + ':' + rule.value + ' !important;';
	}).join('') + '}';
}

function getPageStyle (conf) {
	const output = [];
	if (conf.minFontSize > 0) {
		output.push(createStyle([
			'body',
			'#all',
			'#top-nav',
			'#top-nav a',
			'.sidebar .block .content',
			'#footer',
			'.node .links'
		], [{
			name: 'font-size',
			value: conf.minFontSize + 'px'
		}]));
	}
	if (conf.minWidth > 0) {
		output.push(createStyle(['.sidebar'], [{
			name: 'min-width',
			value: conf.minWidth + 'px'
		}]));
	}
	if (conf.hideLeftSidebar) {
		output.push(createStyle(['#sidebar-left'], [{
			name: 'display',
			value: 'none'
		}]));
	}

	if (conf.maxIndentLevel > 0) {
		output.push(createStyle([
			times('.indented', conf.maxIndentLevel).join(' '),
		], [{
			name: 'margin-left',
			value: 0,
		}]));
	}

	if (conf.hideRightSidebar) {
		output.push(createStyle(['#sidebar-right'], [{
			name: 'display',
			value: 'none'
		}]));
	}
	return output;
}

export { getPageStyle };
