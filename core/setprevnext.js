export default function setPrevNextLinks (flatNodes) {
	let lastNew = null;

	return flatNodes.reduce((output, node, index) => {
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
