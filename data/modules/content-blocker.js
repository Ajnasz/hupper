import * as twitter from './content-blockers/twitter';
import * as youtube from './content-blockers/youtube';

const TYPES = {
	TWITTER: twitter.TYPE,
	YOUTUBE: youtube.TYPE
};

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

export {
	TYPES,
	provideUnblock,
};
