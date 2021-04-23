(function() {
  let baseSize = 24;
	let wireTension = 5;

  window.workspace = {};

  workspace.canvas = document.getElementById("canvas");
	workspace.buffercanvas = document.createElement("canvas");
  workspace.animation = null; // {target: null, targettype: "gate/connection", starttime: 0, duration: 20, callback: null}
  workspace.maingraph = {
    singleinstance: true,
    objects: [],
    scale: 8,
    x: 0,
    y: 0
  }
  workspace.currentgraph = workspace.maingraph;
  workspace.userdefinedgraphs = [];
	workspace.gridEnabled = false;
  let canvas = workspace.canvas;
  let ctx = canvas.getContext("2d");
	let bufferctx = workspace.buffercanvas.getContext("2d");

  workspace.draw = function(time, hitTest, x, y) {
		let hits = [];
		if (!hitTest) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}
		if (!hitTest && workspace.gridEnabled) {
			let spacing = 5 * workspace.currentgraph.scale;
			let leftEdge = workspace.currentgraph.x - (workspace.canvas.width / 2) / workspace.currentgraph.scale;
			let topEdge = workspace.currentgraph.y - (workspace.canvas.height / 2) / workspace.currentgraph.scale;
			let gridOffsetX = Math.floor(leftEdge / 5) * 5;
			let gridOffsetY = Math.floor(topEdge / 5) * 5;
			let gridOffsetScreen = workspace.graphPointToDisplayPoint(gridOffsetX, gridOffsetY);
			//console.log(gridOffsetX + " " + gridOffsetY);
			ctx.strokeStyle = "#EEEEEE";
			ctx.lineWidth = 3;
			for (let i = 0; ; i++) {
				let x = gridOffsetScreen.x + i * spacing;
				if (x > workspace.canvas.width) {
					break;
				}
				ctx.beginPath();
				ctx.moveTo(x, 0);
				ctx.lineTo(x, workspace.canvas.height);
				ctx.stroke();
			}
			for (let i = 0; ; i++) {
				let y = gridOffsetScreen.y + i * spacing;
				if (y > workspace.canvas.height) {
					break;
				}
				ctx.beginPath();
				ctx.moveTo(0, y);
				ctx.lineTo(workspace.canvas.width, y);
				ctx.stroke();
			}
		}
    for (let i = 0; i < workspace.currentgraph.objects.length; i++) {
      let object = workspace.currentgraph.objects[i];
      if (object.static.type = "gate") {
        let centerPoint = {};
        if (workspace.onDisplay(object.x, object.y, baseSize * workspace.currentgraph.scale, baseSize * workspace.currentgraph.scale, centerPoint)) {
          object.visible = true;
          let icon = object.static.icon;
          let left = centerPoint.x - (baseSize * workspace.currentgraph.scale) / 2;
          let top = centerPoint.y - (baseSize * workspace.currentgraph.scale) / 2;
          ctx.scale(workspace.currentgraph.scale, workspace.currentgraph.scale);
          ctx.translate((left / workspace.currentgraph.scale) + 0.5, (top / workspace.currentgraph.scale) + 0.5);

					if (!hitTest) {
						ctx.fillStyle = "#555555";
	          ctx.fill(icon);
					} else if (ctx.isPointInPath(icon, x, y)) {
						hits.push({target: object, hitType: "object"});
					}
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        } else {
          object.visible = false;
        }
      }
    }
		for (let i = 0; i < workspace.currentgraph.objects.length; i++) {
			let object = workspace.currentgraph.objects[i];
			if (object.static.type == "gate" && object.visible) {
				for (let ii = 0; ii < object.inputs.length; ii++) {
					let input = object.inputs[ii];
					if (!input.occupied) {

					}
				}
			}
		}
    if (!hitTest && workspace.animation != null) {
      if (time <= workspace.animation.starttime + workspace.animation.duration) {
        workspace.redraw();
      } else {
        workspace.animation = null;
      }
    }
  };
  workspace.graphPointToDisplayPoint = function(x, y) {
    let scaledX = (x - workspace.maingraph.x) * workspace.currentgraph.scale;
    let scaledY = (y - workspace.maingraph.y) * workspace.currentgraph.scale;
    let screenX = scaledX + canvas.width / 2;
    let screenY = scaledY + canvas.height / 2;
    return {x: screenX, y: screenY};
  };
  workspace.displayPointToGraphPoint = function(x, y) {
    let centeredX = (x * 2) - canvas.width / 2;
    let centeredY = (y * 2) - canvas.height / 2;
    let graphX = (centeredX / workspace.currentgraph.scale) + workspace.currentgraph.x;
    let graphY = (centeredY / workspace.currentgraph.scale) + workspace.currentgraph.y;
    return {x: graphX, y: graphY};
  };
  workspace.onDisplay = function(x, y, width, height, outDisplayPoint) {
    let displayPoint = workspace.graphPointToDisplayPoint(x, y);
    outDisplayPoint.x = displayPoint.x;
    outDisplayPoint.y = displayPoint.y;
    let left = displayPoint.x - ((width / 2) * workspace.currentgraph);
    let top = displayPoint.y - ((height / 2) * workspace.currentgraph);
    let right = displayPoint.x + ((width / 2) * workspace.currentgraph);
    let bottom = displayPoint.y + ((height / 2) * workspace.currentgraph);

    if (left > canvas.width || right < 0 || top > canvas.height || bottom < 0) {
      return false;
    } else {
      return true;
    }
  };
  workspace.redraw = function() {
    requestAnimationFrame(function(time) {
			workspace.draw(time, false, 0, 0);
		});
  };
	workspace.hitTest = function(x, y) {
		return workspace.draw(0, true, x, y);
	}
	workspace.resize = function() {
		workspace.canvas.width = workspace.canvas.clientWidth * 2;
		workspace.canvas.height = 0;
		workspace.canvas.height = workspace.canvas.clientHeight * 2;

		workspace.buffercanvas.width = workspace.canvas.clientWidth * 2;
		workspace.buffercanvas.height = workspace.canvas.clientHeight * 2;

		workspace.redraw();
	};

	let curveInterpolate = function(x1, y1, o1, x2, y2, o2) { // orientation: 0 = inputs on left, outputs on right | 1 = inputs on top, outputs on bottom | 2 = inputs on right, outputs on left | 3 = inputs on bottom, outputs on top
		let curve = [];
		if (o1 == 0 && o2 == 0) {
			let midpoint = (x1 + x2) / 2;
			let min1 = x1 + wireTension * workspace.currentgraph.scale;
			let min2 = x2 - wireTension * workspace.currentgraph.scale;
			if (midpoint > min1) {
				curve.push([{x: x1, y: y1}, {x: midpoint, y: y1}, {x: midpoint, y: y2}, {x: x2, y: y2}]);
			} else {
				let midpointy = (y1 + y2) / 2;
				curve.push([{x: x1, y: y1}, {x: min1, y1}, {x: min1, y: midpointy}, {x: midpoint, y: midpointy}]);
				curve.push([{x: midpoint, y: midpointy}, {x: min2, midpointy}, {x: min2, y: y2}, {x: x2, y: y2}]);
			}
		} else if (o1 == 0 && o2 = 1) {
			let min1 = x1 + wireTension * workspace.currentgraph.scale;
			let min2 = y2 - wireTension * workspace.currentgraph.scale;
			if (x2 >= min1) {
				if (min2 >= y1) {
					curve.push([{x: x1, y: y1}, {x: x2, y: y1}, {x: x2, y: y2}]);
				} else {
					let midpointx = (x1 + x2) / 2;
					let midpointy = (y1 + y2) / 2;
					curve.push([{x: x1, y: y1}, {x: midpointx, y: y1}, {x: midpointx, y: midpointy}]);
					curve.push([{x: midpointx, y: midpointy}, {x: midpointx, y: min2}, {x: x2, y: min2}, {x: x2, y: y2}]);
				}
			} else {
				if (min2 >= y1) {
					let midpointx = (x1 + x2) / 2;
					let midpointy = (y1 + y2) / 2;
					curve.push([{x: x1, y: y1}, {x: min1, y: y1}, {x: min1, y: midpointy}, {x: midpointx, y: midpointy}]);
					curve.push([{x: midpointx, y: midpointy}, {x: x2, y: midpointy}, {x: x2, y: y2}]);
				} else {

				}
			}
		}
	}
})();
