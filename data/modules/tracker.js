import * as dom from '../../core/dom';
import * as func from '../../core/func';
import { getUserIdFromLink } from './user-data';

const Content = {
	type: '',
	title: '',
	author: {
		name: '',
		id: 0,
	},
	answers: {
		total: 0,
		new: 0,
	},
	lastPost: ''
};

function getTitle (tds) {
	return tds[1].textContent.replace(/\s+frissült$/, '');
}

function getHref (tds) {
	return dom.selectOne('a', tds[1]).href;
}

function getType (tds) {
	return tds[0].textContent;
}

function getAuthor (tds) {
	const link = dom.selectOne('a', tds[2]);

	if (!link) {
		return {
			name: tds[2].textContent,
			id: 0,
		};
	}

	return {
		name: link.textContent,
		id: getUserIdFromLink(link)
	};
}

function getAnswers (tds) {
	const answersContainer = tds[3];
	const newAnswersLink = answersContainer.querySelector('a');
	let newAnswers = 0;

	if (newAnswersLink) {
		newAnswers = parseInt(newAnswersLink.textContent.replace(/^(\d+).*/, '$1'), 10);
	}

	const childNodes = func.toArray(answersContainer.childNodes);

	const total = parseInt(func.first(childNodes, n => n.nodeType === Node.TEXT_NODE).textContent, 10);

	return {
		total,
		new: newAnswers
	};
}

function getLastPost (tds) {
	return tds[4].textContent;
}

function getContents (doc) {
	return func.toArray(doc.querySelectorAll('#tracker tr'))
		.filter(tr => tr.firstChild.nodeName === 'TD')
		.map(tr => dom.selectAll('td', tr))
		.map((tds) => Object.assign({}, Content, {
			type: getType(tds),
			title: getTitle(tds),
			author: getAuthor(tds),
			answers: getAnswers(tds),
			href: getHref(tds),
			lastPost: getLastPost(tds),
		}));
}

export default { getContents };
