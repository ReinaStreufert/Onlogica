(function() {
	window.logic = {};
	window.logic.abstract = {};

	logic.abstract.gate = {};
	let abstractgate = logic.abstract.gate;
	abstractgate.new = function(inputs, outputs) {
		let gate = {};
		gate.static = null;
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

	andgate.static = {};
	andgate.static.majortype = "gate";
	andgate.static.savetype = "and";
	andgate.static.icon = "M2,4V20H14A8,8 0 0,0 22,12A8,8 0 0,0 14,4H2M4,6H14A6,6 0 0,1 20,12A6,6 0 0,1 14,18H4V6Z";

	andgate.new = function() {
		let gate = logic.abstract.twoinputgate.new(function(input1val, input2val) {
			return (input1val && input2val);
		});
		gate.static = andgate.static;
		// TODO: icon, input and output display offsets
		return gate;
	};

	logic.orgate = {};
	let orgate = logic.orgate;

	orgate.static = {};
	orgate.static.majortype = "gate";
	orgate.static.savetype = "or";
	orgate.static.icon = "M2,4C5,10 5,14 2,20H8C13,20 19,16 22,12C19,8 13,4 8,4H2M5,6H8C11.5,6 16.3,9 19.3,12C16.3,15 11.5,18 8,18H5C6.4,13.9 6.4,10.1 5,6Z";

	orgate.new = function() {
		let gate = logic.abstract.twoinputgate.new(function(input1val, input2val) {
			return (input1val || input2val);
		});
		gate.static = orgate.static;
		// TODO: icon, input and output display offsets
		return gate;
	};

	logic.xorgate = {};
	let xorgate = logic.xorgate;

	xorgate.static = {};
	xorgate.static.majortype = "gate";
	xorgate.static.savetype = "xor";
	xorgate.static.icon = "M2,4C5,10 5,14 2,20H4C7,14 7,10 4.1,4H2M6,4C9,10 9,14 6,20H9C14,20 18,17 22,12C18,7 14,4 9,4H6M9,6C12.8,6 16,8.1 19.3,12C15.9,15.9 12.8,18 9,18C10.5,14 10.5,10 9,6Z";

	xorgate.new = function() {
		let gate = logic.abstract.twoinputgate.new(function(input1val, input2val) {
			return ((input1val && !input2val) || (!input1val && input2val));
		});
		gate.static = xorgate.static;
		// TODO: icon, input and output display offsets
		return gate;
	};

	logic.notgate = {};
	let notgate = logic.notgate;

	notgate.static = {};
	notgate.static.majortype = "gate";
	notgate.static.savetype = "not";
	notgate.static.icon = "M2,4V20L16.2,13C16.62,14.19 17.74,15 19,15A3,3 0 0,0 22,12A3,3 0 0,0 19,9C17.74,9 16.62,9.81 16.2,11L2,4M4,7.3L13.7,12L4,16.7V7.3M19,11C19.5,11 20,11.5 20,12C20,12.5 19.5,13 19,13A1,1 0 0,1 18,12C18,11.5 18.5,11 19,11Z";

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
		gate.static = notgate.static;
		// TODO: icon, input and output display offsets
		return gate;
	};

	logic.nandgate = {};
	let nandgate = logic.nandgate;

	nandgate.static = {};
	nandgate.static.majortype = "gate";
	nandgate.static.savetype = "nand";
	nandgate.static.icon = "M2,4V20H10C13.43,20 16.5,17.84 17.6,14.6C18,14.8 18.5,15 19,15A3,3 0 0,0 22,12A3,3 0 0,0 19,9C18.5,9 18.03,9.15 17.6,9.4C16.5,6.16 13.43,4 10,4H2M4,6H10A6,6 0 0,1 16,12A6,6 0 0,1 10,18H4V6M19,11C19.5,11 20,11.5 20,12C20,12.5 19.5,13 19,13A1,1 0 0,1 18,12C18,11.5 18.5,11 19,11Z";

	nandgate.new = function() {
		let gate = logic.abstract.twoinputgate.new(function(input1val, input2val) {
			return (!(input1val && input2val));
		});
		gate.static = nandgate.static;
		// TODO: icon, input and output display offsets
		return gate;
	};

	logic.norgate = {};
	let norgate = logic.norgate;

	norgate.static = {};
	norgate.static.majortype = "gate";
	norgate.static.savetype = "nor";
	norgate.static.icon = "M2,4C5,10 5,14 2,20H5C9.4,20 13,17.7 16.6,13.7C17.15,14.5 18.04,15 19,15A3,3 0 0,0 22,12A3,3 0 0,0 19,9C18.04,9 17.15,9.5 16.6,10.3C13,6.3 9.4,4 5,4H2M5,6C8.8,6 12,8.1 15.3,12C12,15.9 8.8,18 5,18C6.5,14 6.5,10 5,6M19,11C19.5,11 20,11.5 20,12C20,12.5 19.5,13 19,13A1,1 0 0,1 18,12C18,11.5 18.5,11 19,11Z";

	norgate.new = function() {
		let gate = logic.abstract.twoinputgate.new(function(input1val, input2val) {
			return (!(input1val || input2val));
		});
		gate.static = norgate.static;
		// TODO: icon, input and output display offsets
		return gate;
	};

	logic.xnorgate = {};
	let xnorgate = logic.xnorgate;

	xnorgate.static = {};
	xnorgate.static.majortype = "gate";
	xnorgate.static.savetype = "xnor";
	xnorgate.static.icon = "M2,4C5,10 5,14 2,20H4C7,14 7,10 4.1,4H2M6,4C9,10 9,14 6,20H9C12.2,20 14.8,16.8 16.7,14C17.28,14.65 18.12,15 19,15A3,3 0 0,0 22,12A3,3 0 0,0 19,9C18.12,9 17.28,9.35 16.7,10C14.7,7.2 12.2,4 9,4H6M9,6C12,6 14,10 15.5,12C14,14 12,18 9,18C10.6,14 10.6,10 9,6M19,11C19.5,11 20,11.5 20,12C20,12.5 19.5,13 19,13A1,1 0 0,1 18,12C18,11.5 18.5,11 19,11Z";

	xnorgate.new = function() {
		let gate = logic.abstract.twoinputgate.new(function(input1val, input2val) {
			return (!((input1val && !input2val) || (!input1val && input2val)));
		});
		gate.static = xnorgate.static;
		// TODO: icon, input and output display offsets
		return gate;
	};
})();
