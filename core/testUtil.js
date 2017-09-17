function spy () {
	let callCount = 0;
	let calls = [];

	function func () {
		++callCount;
		calls.push({
			args: Array.from(arguments)
		});
	}

	func.getCalls = function () {
		return calls;
	};

	func.getCallCount = function () {
		return callCount;
	};

	func.reset = function () {
		callCount = 0;
		calls = [];
	};

	return func;
}

export { spy };
