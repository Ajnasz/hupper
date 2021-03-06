import createRequestBlocker from './base';
const BLOCK_URLS = ['*://platform.twitter.com/widgets.js'];
const BLOCK_TYPES = ['script'];

const getBlocker = createRequestBlocker({ BLOCK_URLS, BLOCK_TYPES });

export {
	getBlocker
};
