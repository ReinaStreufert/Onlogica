window.logic = {};

logic.abstractgate = {};
let abstractgate = logic.abstractgate;
abstractgate.new = function(inputs, outputs) {
	let gate = {};
	gate.x = 0;
	gate.y = 0;
	gate.inputs = [];
	for (let i = 0; i < inputs; i++) {
		let inputDescriptor = {};
		inputDescriptor.bundleCount = 1;
		inputDescriptor.values = [false];
		inputDescriptor.relativeX = 0;
		inputDescriptor.relativeY = 0;
		inputDescriptor.parent = gate;
		gate.inputs.push(inputDescriptor);
	}
	gate.outputs = [];
	for (let i = 0; i < outputs; i++) {
		let outputDescriptor = {};
		outputDescriptor.bundleCount = 1;
		outputDescriptor.destination = null;
		outputDescriptor.relativeX = 0;
		outputDescriptor.relativeY = 0;
	}
}
