(function() {
  window.tools = {};

  tools.pan = {};
  let pan = tools.pan;
  pan.startWorkspaceX = 0;
  pan.startWorkspaceY = 0;
  pan.active = false;
  pan.drag = function(startX, startY, x, y, graph) {
    if (!pan.active) {
      pan.startWorkspaceX = graph.x;
      pan.startWorkspaceY = graph.y;
      pan.active = true;
    }
    let difX = x - startX;
    let difY = y - startY;
    graph.x = pan.startWorkspaceX - difX;
    graph.y = pan.startWorkspaceY - difY;
    workspace.redraw();
  };
  pan.switch = function() {
    window.tools.currenttool = pan;
    // TODO: mfin controls
  };
  pan.enddrag = function() {
    pan.active = false;
  };

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
    let x = (e.clientX - canvasRect.x) / (workspace.currentgraph.scale / 2);
    let y = (e.clientY - canvasRect.y) / (workspace.currentgraph.scale / 2);
    currentdrag.startX = x;
    currentdrag.startY = y;
    tools.currenttool.drag(currentdrag.startX, currentdrag.startY, x, y, workspace.currentgraph);
  });
  workspace.canvas.addEventListener("mousemove", function(e) {
    if (currentdrag.dragging) {
      let canvasRect = workspace.canvas.getBoundingClientRect();
      let x = (e.clientX - canvasRect.x) / (workspace.currentgraph.scale / 2);
      let y = (e.clientY - canvasRect.y) / (workspace.currentgraph.scale / 2);
      //console.log(x + " " + y);
      tools.currenttool.drag(currentdrag.startX, currentdrag.startY, x, y, workspace.currentgraph);
    }
  });
  workspace.canvas.addEventListener("mouseup", function(e) {
    if (currentdrag.dragging) {
      currentdrag.dragging = false;
      tools.currenttool.enddrag();
    }
  });
})();
