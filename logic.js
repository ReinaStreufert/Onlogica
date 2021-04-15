(function() {
	window.logic = {};
	window.logic.abstract = {};

	logic.abstract.gate = {};
	let abstractgate = logic.abstract.gate;
	abstractgate.new = function(inputs, outputs) {
		let gate = {};
		gate.type = "gate";
		gate.x = 0;
		gate.y = 0;
		gate.orientation = 0; // 0 = inputs on left, outputs on right | 1 = inputs on top, outputs on bottom | 2 = inputs on right, outputs on left | 3 = inputs on bottom, outputs on top
		gate.inputs = [];
		for (let i = 0; i < inputs; i++) {
			let input = {};
			input.bundleCount = 1;
			input.values = [false];
			input.uncommitedvalues = [false];
			input.updating = false;
			input.relativeX = 0;
			input.relativeY = 0;
			input.parent = gate;
			gate.inputs.push(input);
		}
		gate.outputs = [];
		for (let i = 0; i < outputs; i++) {
			let output = {};
			output.bundleCount = 1;
			output.destinations = [];
			output.relativeX = 0;
			output.relativeY = 0;
			gate.outputs.push(output);
		}
		gate.icon = null;
		gate.update = null;
		gate.commit = function() {
			let changeMade = false;
			for (let i = 0; i < gate.inputs.length; i++) {
				let input = gate.inputs[i];
				if (input.updating) {
					changeMade = true;
					for (let ii = 0; ii < input.values.length; ii++) {
						input.values[ii] = input.uncommitedvalues[ii];
					}
					input.updating = false;
				}
			}
			if (changeMade) {
				for (let i = 0; i < gate.outputs.length; i++) {
					let output = gate.outputs[i];
					for (let ii = 0; ii < output.destinations.length; ii++) {
						output.destinations[ii].parent.commit();
					}
				}
			}
		};
		gate.rollback = function() {
			let changeMade = false;
			for (let i = 0; i < gate.inputs.length; i++) {
				let input = gate.inputs[i];
				if (input.updating) {
					changeMade = true;
					for (let ii = 0; ii < input.values.length; ii++) {
						input.uncommitedvalues[ii] = input.values[ii];
					}
					input.updating = false;
				}
			}
			if (changeMade) {
				for (let i = 0; i < gate.outputs.length; i++) {
					let output = gate.outputs[i];
					for (let ii = 0; ii < output.destinations.length; ii++) {
						output.destinations[ii].parent.rollback();
					}
				}
			}
		}

		return gate;
	};

	logic.abstract.twoinputgate = {};
	let twoinputgate = logic.abstract.twoinputgate;
	twoinputgate.new = function(operation) {
		let gate = logic.abstract.gate.new(2, 1);
		gate.output = gate.outputs[0];
		gate.update = function() {
			let newOutput = operation(gate.inputs[0].uncommitedvalues[0], gate.inputs[1].uncommitedvalues[0]);
			for (let i = 0; i < gate.output.destinations.length; i++) {
				let dest = gate.output.destinations[i];
				if (dest.uncommitedvalues[0] != newOutput) {
					if (dest.updating) {
						return false;
					} else {
						dest.uncommitedvalues[0] = newOutput;
						dest.updating = true;
						if (!dest.parent.update()) {
							return false;
						}
					}
				}
			}
			return true;
		};
		return gate;
	};

	logic.andgate = {};
	let andgate = logic.andgate;
	andgate.new = function() {
		let gate = logic.abstract.twoinputgate.new(function(input1val, input2val) {
			return (input1val && input2val);
		});
		// TODO: icon, input and output display offsets
		return gate;
	};

	logic.orgate = {};
	let orgate = logic.orgate;
	orgate.new = function() {
		let gate = logic.abstract.twoinputgate.new(function(input1val, input2val) {
			return (input1val || input2val);
		});
		// TODO: icon, input and output display offsets
		return gate;
	};

	logic.xorgate = {};
	let xorgate = logic.xorgate;
	xorgate.new = function() {
		let gate = logic.abstract.twoinputgate.new(function(input1val, input2val) {
			return ((input1val && !input2val) || (!input1val && input2val));
		});
		// TODO: icon, input and output display offsets
		return gate;
	};

	logic.notgate = {};
	let notgate = logic.notgate;
	notgate.new = function() {
		let gate = logic.abstract.gate.new(1, 1);
		gate.output = gate.outputs[0];
		gate.input = gate.inputs[0];
		gate.update = function() {
			let newOutput = !gate.input.uncommitedvalues[0];
			for (let i = 0; i < gate.output.destinations.length; i++) {
				let dest = gate.output.destinations[i];
				if (dest.uncommitedvalues[0] != newOutput) {
					if (dest.updating) {
						return false;
					} else {
						dest.uncommitedvalues[0] = newOutput;
						dest.updating = true;
						if (!dest.parent.update()) {
							return false;
						}
					}
				}
			}
			return true;
		};
		// TODO: icon, input and output display offsets
		return gate;
	};

	logic.nandgate = {};
	let nandgate = logic.nandgate;
	nandgate.new = function() {
		let gate = logic.abstract.twoinputgate.new(function(input1val, input2val) {
			return (!(input1val && input2val));
		});
		// TODO: icon, input and output display offsets
		return gate;
	};

	logic.norgate = {};
	let norgate = logic.norgate;
	norgate.new = function() {
		let gate = logic.abstract.twoinputgate.new(function(input1val, input2val) {
			return (!(input1val || input2val));
		});
		// TODO: icon, input and output display offsets
		return gate;
	};

	logic.xnorgate = {};
	let xnorgate = logic.xnorgate;
	xnorgate.new = function() {
		let gate = logic.abstract.twoinputgate.new(function(input1val, input2val) {
			return (!((input1val && !input2val) || (!input1val && input2val)));
		});
		// TODO: icon, input and output display offsets
		return gate;
	};
})();
