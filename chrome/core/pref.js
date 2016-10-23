var prefs = Object.create(null, {
	getCleanHighlightedUsers: {
		value: function () {
			return this.getPref('highlightusers').then(highlightusers => {
				return new Promise(resolve => {
					let value;
					if (highlightusers === null) {
						value = [];
					} else {
						value = highlightusers.split(',').filter(function (user) {
							return user.trim() !== '';
						}).map(function (user) {
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

					resolve(value);
				});
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
						value = trolls.split(',').filter(troll => {
							return troll.trim() !== '';
						});
					}

					resolve(value);
				});
			});
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
						value = JSON.parse(taxonomies).map(t => t.trim()).filter(t => t !== '');
					}

					resolve(value);
				});
			});
		}
	}
});

export { prefs };
