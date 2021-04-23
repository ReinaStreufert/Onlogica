(function() {
  window.tools = {};

  tools.pan = {};
  let pan = tools.pan;
  pan.lastX = 0;
  pan.lastY = 0;
  pan.active = false;
  pan.drag = function(startX, startY, x, y, graph) {
    if (!pan.active) {
      pan.lastX = x;
      pan.lastY = y;
      pan.active = true;
    }

		let zoomedX = x / (graph.scale / 2);
		let zoomedY = y / (graph.scale / 2);
		let zoomedLastX = pan.lastX / (graph.scale / 2);
		let zoomedLastY = pan.lastY / (graph.scale / 2);

    let difX = zoomedX - zoomedLastX;
    let difY = zoomedY - zoomedLastY;
    graph.x = graph.x - difX;
    graph.y = graph.y - difY;

		pan.lastX = x;
		pan.lastY = y;
    workspace.redraw();
  };
  pan.switch = function() {
    window.tools.currenttool = pan;
    // TODO: mfin controls
  };
  pan.enddrag = function() {
    pan.active = false;
  };
	workspace.canvas.addEventListener("wheel", function(e) {
		e.preventDefault();

		let wheel = e.deltaY < 0 ? 1 : -1;
		let canvasRect = workspace.canvas.getBoundingClientRect();
		let x = ((e.clientX - canvasRect.x) * 2) - workspace.canvas.width / 2;
		let y = ((e.clientY - canvasRect.y) * 2) - workspace.canvas.height / 2;
		let zoom = Math.exp(wheel * 0.2);
		if (workspace.currentgraph.scale * zoom < 2) {
			return;
		}

		workspace.currentgraph.x -= x / (workspace.currentgraph.scale * zoom) - x / workspace.currentgraph.scale;
		workspace.currentgraph.y -= y / (workspace.currentgraph.scale * zoom) - y / workspace.currentgraph.scale;
		workspace.currentgraph.scale = workspace.currentgraph.scale * zoom;

		workspace.redraw();
	});

  tools.select = {};
  let select = tools.select;
  select.drag = function(startX, startY, x, y, graph) {
    // TODO: all the selecty thingies idk shut up
  };
  select.switch = function() {
    window.tools.currenttool = select;
    // TODO: again mfin controls
  };
  select.enddrag = function() {
    // TODO: bruh kys
  }

  window.tools.currenttool = tools.select;

  tools.currentdrag = {};
  let currentdrag = tools.currentdrag;
  currentdrag.dragging = false;
  currentdrag.startX = 0;
  currentdrag.startY = 0;
  workspace.canvas.addEventListener("mousedown", function(e) {
    currentdrag.dragging = true;
    let canvasRect = workspace.canvas.getBoundingClientRect();
    let x = (e.clientX - canvasRect.x)
    let y = (e.clientY - canvasRect.y);
    currentdrag.startX = x;
    currentdrag.startY = y;
    tools.currenttool.drag(currentdrag.startX, currentdrag.startY, x, y, workspace.currentgraph);
  });
  window.addEventListener("mousemove", function(e) {
    if (currentdrag.dragging) {
      let canvasRect = workspace.canvas.getBoundingClientRect();
      let x = (e.clientX - canvasRect.x);
      let y = (e.clientY - canvasRect.y);
      //console.log(x + " " + y);
      tools.currenttool.drag(currentdrag.startX, currentdrag.startY, x, y, workspace.currentgraph);
    }
  });
  window.addEventListener("mouseup", function(e) {
    if (currentdrag.dragging) {
      currentdrag.dragging = false;
      tools.currenttool.enddrag();
    }
  });
})();
