import time from './time';

const CACHE_CLEAR_INTERVAL = time.SECOND / 500;
const CACHE = new Map();
let timeout = null;

function hasCachedItem () {
	return CACHE.size > 0;
}

function isExpired (key) {
	if (CACHE.has(key)) {
		return CACHE.get(key).expires < Date.now();
	}

	return false;
}

function stopCheckExpired () {
	if (timeout) {
		clearTimeout(timeout);
		timeout = null;
	}
}

function startCheckExpired () {
	stopCheckExpired();

	CACHE.forEach((data, key) => {
		if (isExpired(key)) {
			unset(key);
		}
	});

	if (hasCachedItem()) {
		timeout = setTimeout(startCheckExpired, CACHE_CLEAR_INTERVAL);
	}
}

function set (key, value, expire = time.MINUTE) {
	CACHE.set(key, {
		expires: Date.now() + expire,
		value,
	});

	startCheckExpired();
}

function unset (key) {
	const ret = CACHE.delete(key);

	if (!hasCachedItem()) {
		stopCheckExpired();
	}

	return ret;
}

function get (key) {
	if (CACHE.has(key)) {
		if (!isExpired(key)) {
			return CACHE.get(key).value;
		}

		unset(key);
	}

	return null;
}

function has (key) {
	return CACHE.has(key);
}
export default { set, get, unset, has };
