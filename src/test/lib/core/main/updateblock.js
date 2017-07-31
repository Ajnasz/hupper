import updateBlock from '../../../../lib/core/main/updateblock';

const test = require('tape');

test.skip('lib/core/main/updateBlock', (t) => {
	updateBlock();
	t.end();
});
