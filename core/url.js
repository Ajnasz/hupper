function searchParams (search) {
	const searchStr = (search[0] === '?') ?  search.slice(1) : search;
	let obj = {};

	if (search) {
		obj = searchStr.split('&')
			.map(item => item.split('='))
			.reduce((out, item) => {
				let values = out[item[0]] ? out[item[0]] : [];
				return Object.assign({}, out, {[item[0]]: values.concat(item[1])});
			}, {});
	}

	return {
		toString () {
			return Object.keys(obj)
				.reduce((out, key) => out.concat(obj[key]
					.reduce((o, i) => o.concat(`${key}=${i}`), [])),
				[])
				.join('&');
		},
		set (name, value) {
			obj[name] = [value];
			return this;
		},
	};
}

export default {
	searchParams,
};
