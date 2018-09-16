export default function setPrevNextLinks (flatNodes) {
	let lastNew = null;
	console.log('set next prev', flatNodes); /* eslint-disable-line */

	return flatNodes.reduce((output, node, index) => {
		console.log('reduce', node, lastNew); /* eslint-disable-line */
		if (!node.isNew || node.hide) {
			output[index] = node;
			return output;
		}

		if (lastNew === null) {
			output[index] = node;
		} else {
			output[lastNew] = Object.assign({}, output[lastNew], { nextId: node.id });
			output[index] = Object.assign({}, node, { prevId: output[lastNew].id });
		}

		lastNew = index;

		return output;
	}, []);
}
