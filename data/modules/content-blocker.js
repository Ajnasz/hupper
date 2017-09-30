/* global chrome:true */
import * as twitter from './content-blockers/twitter';

const TYPES = {
	TWITTER: twitter.TYPE
};

function unblock (target) {
	chrome.runtime.sendMessage({ event: 'unblock-me', target }, () => {
		switch (target) {
			case TYPES.TWITTER:
				twitter.unblock();
				break;
		}
	});
}

function provideUnblock (target) {
	switch (target) {
		case TYPES.TWITTER:
			twitter.provideUnblock();
			break;
	}
}

twitter.EVENTS.on('unblock', () => {
	unblock(TYPES.TWITTER);
});

export {
	TYPES,
	unblock,
	provideUnblock,
};
