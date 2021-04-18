(function() {
  let baseSize = 24;

  window.workspace = {};

  workspace.canvas = document.getElementById("canvas");
  workspace.animation = null; // {target: null, starttime: 0, duration: 20, callback: null}
  workspace.maingraph = {
    singleinstance: true,
    objects: [],
    scale: 8,
    x: 0,
    y: 0
  }
  workspace.currentgraph = workspace.maingraph;
  workspace.userdefinedgraphs = [];
  let canvas = workspace.canvas;
  let ctx = canvas.getContext("2d");

  workspace.draw = function(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < workspace.currentgraph.objects.length; i++) {
      let object = workspace.currentgraph.objects[i];
      if (object.static.type = "gate") {
        let centerPoint = {};
        if (workspace.onDisplay(object.x, object.y, baseSize * workspace.currentgraph.scale, baseSize * workspace.currentgraph.scale, centerPoint)) {
          object.visible = true;
          let icon = object.static.icon;
          let left = centerPoint.x - (baseSize * workspace.currentgraph.scale) / 2;
          let top = centerPoint.y - (baseSize * workspace.currentgraph.scale) / 2;
          //console.log(left);
          //console.log(top);
          ctx.scale(workspace.currentgraph.scale, workspace.currentgraph.scale);
          ctx.translate((left / workspace.currentgraph.scale) + 0.5, (top / workspace.currentgraph.scale) + 0.5);
          ctx.fillStyle = "#555555";
          //ctx.shadowColor = "rgba(0,0,0,0.37)";
          //ctx.shadowBlur = 25;
          ctx.fill(icon);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        } else {
          object.visible = false;
        }
      }
    }
    if (workspace.animation != null) {
      if (time <= workspace.animation.starttime + workspace.animation.duration) {
        requestAnimationFrame(workspace.draw);
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
    let graphX = (centeredX + workspace.maingraph.x) / workspace.currentgraph.scale;
    let graphY = (centeredY + workspace.maingraph.y) / workspace.currentgraph.scale;
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
})();
