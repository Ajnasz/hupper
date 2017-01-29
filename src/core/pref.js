import * as func from './func';
import { log } from './log';

function filterEmpty (array) {
	return array.map(item => item.trim()).filter(item => item !== '');
}

function oldHighlightedUserGetter (highlightusers) {
	return filterEmpty(highlightusers.split(',')).map((user) => {
		return user.split(':');
	}).filter(function (user) {
		return user.length === 2 && Boolean(user[0]) && Boolean(user[1]);
	}).map(function (user) {
		return {
			name: user[0],
			color: user[1]
		};
	});
}

function oldTrollGetter (trolls) {
	return trolls.split(',');
}

var pref = Object.create(null, {
	getBlocks: {
		value: function () {
			return this.getPref('blocks').then(blocks => {
				if (typeof blocks === 'string') {
					return JSON.parse(blocks);
				}

				return blocks;
			});
		}
	},
	getCleanHighlightedUsers: {
		value: function () {
			return this.getPref('highlightusers').then(highlightusers => {
				return new Promise(resolve => {
					let value;
					if (highlightusers === null) {
						value = [];
					} else {
						let tmpValue;

						if (typeof highlightusers === 'string') {
							try {
								tmpValue = JSON.parse(highlightusers);
							} catch (er) {
								log.error(er);
								tmpValue = oldHighlightedUserGetter(highlightusers);
							}
						} else {
							tmpValue = highlightusers;
						}

						value = tmpValue.filter(user => user && user.name && user.color);
					}

					resolve(value);
				});
			});
		}
	},

	removeHighlightedUser: {
		value: function (userName) {
			return this.getCleanHighlightedUsers()
				.then(highlightusers => highlightusers.filter(user => user.name !== userName))
				.then(filteredUsers => this.setCleanHighlightedUsers(filteredUsers));
		}
	},

	setCleanHighlightedUsers: {
		value: function (users) {
			let cleanUsers = users.filter((user) => {
				return user && user.name && user.color;
			});

			return pref.setPref('highlightusers', cleanUsers);
		}
	},

	addHighlightedUser: {
		value: function (userName, color) {
			return this.getCleanHighlightedUsers().then(users => {
				let index = func.index(users, u => u.name === userName);

				if (index > -1) {
					users[index].color = color;
				} else {
					users.push({name: userName, color: color});
				}

				return this.setCleanHighlightedUsers(users);
			});
		}
	},

	getCleanTrolls: {
		value: function () {
			return this.getPref('trolls').then(trolls => {
				return new Promise(resolve => {
					let value;
					if (trolls === null) {
						value = [];
					} else {
						if (typeof trolls === 'string') {
							try {
								value = JSON.parse(trolls);
							} catch (e) {
								// migrating
								log.log(e);
								value = oldTrollGetter(trolls);
							}
						} else {
							value = trolls;
						}

						value = filterEmpty(value);
					}

					resolve(value);
				});
			});
		}
	},

	removeTroll: {
		value: function (troll) {
			return this.getCleanTrolls().then(trolls => {
				let filteredTrolls = trolls.filter((n) => {
					return n !== troll;
				});
				return this.setCleanTrolls(filteredTrolls);
			});
		}
	},

	addTroll: {
		value: function (troll) {
			return this.getCleanTrolls().then(trolls => {
				if (trolls.indexOf(troll) === -1) {
					trolls.push(troll);
				}

				return this.setCleanTrolls(trolls);
			});
		}
	},

	setCleanTrolls: {
		value: function (trolls) {
			return this.setPref('trolls', filterEmpty(trolls));
		}
	},

	getCleanTaxonomies: {
		value: function () {
			return this.getPref('hidetaxonomy').then(taxonomies => {
				return new Promise(resolve => {
					let value;
					if (!taxonomies) {
						value = [];
					} else {
						if (typeof taxonomies === 'string') {
							value = filterEmpty(JSON.parse(taxonomies));
						} else {
							value = taxonomies;
						}
					}

					resolve(value);
				});
			});
		}
	},

	addTaxonomy: {
		value: function (taxonomy) {
			return this.getCleanTaxonomies().then(taxonomies => {
				if (taxonomies.indexOf(taxonomy) === -1) {
					taxonomies.push(taxonomy);
				}

				return this.setCleanTaxonomies(taxonomies);
			});
		}
	},

	removeTaxonomy: {
		value: function (taxonomy) {
			return this.getCleanTaxonomies().then(taxonomies => {
				let filteredTaxonomies = taxonomies.filter((n) => {
					return n !== taxonomy;
				});
				return this.setCleanTaxonomies(filteredTaxonomies);
			});
		}
	},

	setCleanTaxonomies: {
		value: function (taxonomies) {
			return this.setPref('hidetaxonomy', taxonomies);
		}
	}
});

export default pref;
