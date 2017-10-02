import createRequestBlocker from './base';
const BLOCK_URLS = ['*://www.youtube.com/embed/*'];
const BLOCK_TYPES = ['sub_frame'];

const getBlocker = createRequestBlocker({ BLOCK_URLS, BLOCK_TYPES });

export {
	getBlocker
};
