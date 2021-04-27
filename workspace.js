(function() {
  let baseSize = 24;
  let baseHangRadius = 1.5;
	let baseTension = 25;
  let baseStrokeWidth = 2;
  let unfocusedAlpha = 0.5;

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
  let buffercanvas = workspace.buffercanvas;
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
        if (workspace.onDisplay(object.x, object.y, (baseSize + baseHangRadius) * workspace.currentgraph.scale, (baseSize + baseHangRadius) * workspace.currentgraph.scale, centerPoint)) {
          object.visible = true;
          let icon = object.static.icon;
          let left = 0 - (baseSize * workspace.currentgraph.scale) / 2;
          let top = 0 - (baseSize * workspace.currentgraph.scale) / 2;
          ctx.scale(workspace.currentgraph.scale, workspace.currentgraph.scale);
          ctx.translate((centerPoint.x / workspace.currentgraph.scale), (centerPoint.y / workspace.currentgraph.scale));
          ctx.rotate(object.orientation * (Math.PI / 2));
          ctx.translate((left / workspace.currentgraph.scale), (top / workspace.currentgraph.scale));

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
			if (object.static.type == "gate") {
        if (object.visible) {
          ctx.shadowColor = "rgba(0,0,0,0.37)";
          ctx.shadowBlur = 15;
          for (let ii = 0; ii < object.inputs.length; ii++) {
  					let input = object.inputs[ii];
  					if (!input.occupied) {
              let relativeX = input.relativeX;
              let relativeY = input.relativeY;
              if (object.orientation == 3) {
                relativeX = input.relativeY;
                relativeY = -input.relativeX;
              } else if (object.orientation == 2) {
                relativeX = -input.relativeX;
                relativeY = -input.relativeY;
              } else if (object.orientation == 1) {
                relativeX = -input.relativeY;
                relativeY = input.relativeX;
              }
              let displayPoint = workspace.graphPointToDisplayPoint(object.x + relativeX, object.y + relativeY);
              ctx.fillStyle = "#FFFFFF";
              //ctx.globalAlpha = 0.5;
              ctx.beginPath();
              ctx.ellipse(displayPoint.x, displayPoint.y, baseHangRadius * workspace.currentgraph.scale, baseHangRadius * workspace.currentgraph.scale, 0, 0, 2 * Math.PI);
              if (!hitTest) {
                ctx.fill();
              } else if (ctx.isPointInPath(x, y)) {
                hits.push({target: input, hitType: "input"});
              }
              //ctx.shadowBlur = 0;
              //ctx.globalAlpha = 1;
  					}
  				}
        }
        for (let ii = 0; ii < object.outputs.length; ii++) {
          let output = object.outputs[ii];
          let relativeX = output.relativeX;
          let relativeY = output.relativeY;
          if (object.orientation == 3) {
            relativeX = output.relativeY;
            relativeY = -output.relativeX;
          } else if (object.orientation == 2) {
            relativeX = -output.relativeX;
            relativeY = -output.relativeY;
          } else if (object.orientation == 1) {
            relativeX = -output.relativeY;
            relativeY = output.relativeX;
          }

          let aDisplayPoint = workspace.graphPointToDisplayPoint(object.x + relativeX, object.y + relativeY);
          //let renderMade = false;
          ctx.shadowColor = "rgba(0,0,0,0.37)";
          ctx.shadowBlur = 15;
          for (let iii = 0; iii < output.destinations.length; iii++) {
            let destination = output.destinations[iii];
            relativeX = destination.relativeX;
            relativeY = destination.relativeY;
            if (destination.parent.orientation == 3) {
              relativeX = destination.relativeY;
              relativeY = -destination.relativeX;
            } else if (destination.parent.orientation == 2) {
              relativeX = -destination.relativeX;
              relativeY = -destination.relativeY;
            } else if (destination.parent.orientation == 1) {
              relativeX = -destination.relativeY;
              relativeY = destination.relativeX;
            }
            let bDisplayPoint = workspace.graphPointToDisplayPoint(destination.parent.x + relativeX, destination.parent.y + relativeY);
            let curve = curveInterpolate(aDisplayPoint.x, aDisplayPoint.y, object.orientation, bDisplayPoint.x, bDisplayPoint.y, destination.parent.orientation);
            if (curveVisible(curve)) {
              /*if (!renderMade) {
                bufferctx.clearRect(0, 0, buffercanvas.width, buffercanvas.height);
                renderMade = true;
              }*/
              if (destination.values.length == 1) {
                if (destination.values[0]) {
                  ctx.strokeStyle = "#800080";
                } else {
                  ctx.strokeStyle = "#400040";
                }
              } else {
                ctx.strokeStyle = "#CCCCCC";
              }
              ctx.lineWidth = baseStrokeWidth * workspace.currentgraph.scale;
              ctx.beginPath();
              ctx.moveTo(curve[0].x, curve[0].y);
              ctx.bezierCurveTo(curve[1].x, curve[1].y, curve[2].x, curve[2].y, curve[3].x, curve[3].y);
              if (!hitTest) {
                ctx.globalAlpha = unfocusedAlpha;
                ctx.stroke();
                ctx.globalAlpha = 1;
              } else if (ctx.isPointInStroke(x, y)) {
                hits.push({target: output, destination: destination, hitType: "connection"});
              }

              ctx.fillStyle = "#FFFFFF";
              ctx.beginPath();
              ctx.ellipse(bDisplayPoint.x, bDisplayPoint.y, baseHangRadius * workspace.currentgraph.scale, baseHangRadius * workspace.currentgraph.scale, 0, 0, 2 * Math.PI);
              if (!hitTest) {
                ctx.fill();
              } else if (ctx.isPointInPath(x, y)) {
                hits.push({target: destination, hitType: "input"});
              }
            }
          }
          if (object.visible) {
            ctx.fillStyle = "#FFFFFF";
            ctx.beginPath();
            ctx.ellipse(aDisplayPoint.x, aDisplayPoint.y, baseHangRadius * workspace.currentgraph.scale, baseHangRadius * workspace.currentgraph.scale, 0, 0, 2 * Math.PI);
            if (!hitTest) {
              ctx.fill();
            } else if (ctx.isPointInPath(x, y)) {
              hits.push({target: output, hitType: "output"});
            }
          }
          ctx.shadowBlur = 0;
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
    let tension = baseTension * workspace.currentgraph.scale;
    let curve = [];

    curve.push({x: x1, y: y1});

    if (o1 == 0) {
      curve.push({x: x1 + tension, y: y1});
    } else if (o1 == 1) {
      curve.push({x: x1, y: y1 + tension});
    } else if (o1 == 2) {
      curve.push({x: x1 - tension, y: y1});
    } else if (o1 == 3) {
      curve.push({x: x1, y: y1 - tension});
    }

    if (o2 == 0) {
      curve.push({x: x2 - tension, y: y2});
    } else if (o2 == 1) {
      curve.push({x: x2, y: y2 - tension});
    } else if (o2 == 2) {
      curve.push({x: x2 + tension, y: y2});
    } else if (o2 == 3) {
      curve.push({x: x2, y: y2 + tension});
    }

    curve.push({x: x2, y: y2});

    return curve;
	};
  let curveVisible = function(curve) {
    if (curve[0].x > 0 && curve[0].y > 0 && curve[0].x < canvas.width && curve[0].y < canvas.height) {
      return true;
    }
    if (curve[3].x > 0 && curve[3].y > 0 && curve[3].x < canvas.width && curve[3].y < canvas.height) {
      return true;
    }
    if (bezierIntersect.cubicBezierAABB(curve[0].x, curve[0].y, curve[1].x, curve[1].y, curve[2].x, curve[2].y, curve[3].x, curve[3].y, 0, 0, canvas.width, canvas.height) > 0) {
      return true;
    }
    return false;
  }
})();
