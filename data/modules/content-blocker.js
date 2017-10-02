/* global chrome:true */
import * as twitter from './content-blockers/twitter';
import * as youtube from './content-blockers/youtube';

const TYPES = {
	TWITTER: twitter.TYPE,
	YOUTUBE: youtube.TYPE
};

function unblock (target) {
	chrome.runtime.sendMessage({ event: 'unblock-me', target }, () => {
		switch (target) {
			case TYPES.TWITTER:
				twitter.unblock();
				break;
			case TYPES.YOUTUBE:
				youtube.unblock();
				break;
		}
	});
}

function provideUnblock (target) {
	switch (target) {
		case TYPES.TWITTER:
			twitter.provideUnblock();
			break;
		case TYPES.YOUTUBE:
			youtube.provideUnblock();
			break;
	}
}

twitter.EVENTS.on('unblock', () => {
	unblock(TYPES.TWITTER);
});

youtube.EVENTS.on('unblock', () => {
	unblock(TYPES.YOUTUBE);
});

export {
	TYPES,
	unblock,
	provideUnblock,
};
