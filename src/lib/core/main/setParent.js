export default function setParent (comments, parent) {
	comments.forEach(comment => {
		comment.parent = parent;
		setParent(comment.children, comment);
	});
}
