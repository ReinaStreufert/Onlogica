(function() {
	window.ui = {};
	ui.dockside = "left";

	window.dropdown = {};
	dropdown.new = function(root, items, selectedItemIndex) {
		let dropdownObject = {};
		dropdownObject.root = root;
		dropdownObject.items = root.getElementsByClassName("dropdownitems")[0];
		dropdownObject.htmlItems = [];
		dropdownObject.callbacks = [];
		dropdownObject.measure = root.getElementsByClassName("dropdownmeasure")[0];
		dropdownObject.label = root.getElementsByTagName("p")[0];
		dropdownObject.ItemList = [];
		dropdownObject.SelectedItemIndex = -1;
		dropdownObject.Expanded = false;
		dropdownObject.expanding = false;

		dropdownObject.Expand = function() {
			if (dropdownObject.Expanded) {
				return;
			}
			dropdownObject.root.classList.toggle("dropdown-expanded");
			dropdownObject.items.classList.toggle("dropdownitems-expanded");
			dropdownObject.items.style.height = dropdownObject.measure.clientHeight + "px";
			dropdownObject.Expanded = true;
		};
		dropdownObject.Collapse = function() {
			if (!dropdownObject.Expanded) {
				return;
			}
			dropdownObject.root.classList.toggle("dropdown-expanded");
			dropdownObject.items.classList.toggle("dropdownitems-expanded");
			dropdownObject.items.style.height = "";
			dropdownObject.Expanded = false;
		};
		dropdownObject.AddItem = function(name) {
			dropdownObject.ItemList.push(name);
			let div = document.createElement("div");
			div.classList.toggle("dropdownitem");
			let p = document.createElement("p");
			p.innerText = name;
			div.appendChild(p);
			dropdownObject.measure.appendChild(div);
			let obj = {root: div, text: p, check: null, action: null};
			div.addEventListener("mousedown", function() {
				if (obj.action == null) {
					dropdownObject.SetSelectedItemIndex(dropdownObject.htmlItems.indexOf(obj));
				} else {
					obj.action();
				}
			});

			dropdownObject.htmlItems.push(obj);
			if (dropdownObject.Expanded) {
				dropdownObject.items.style.height = dropdownObject.measure.clientHeight + "px";
			}
		};
		dropdownObject.SetSelectedItemIndex = function(index) {
			if (index == dropdownObject.SelectedItemIndex) {
				return;
			}
			let oldSelectedIndex = dropdownObject.SelectedItemIndex;
			dropdownObject.SelectedItemIndex = index;
			dropdownObject.label.innerText = dropdownObject.ItemList[index];

			if (oldSelectedIndex != -1) {
				dropdownObject.htmlItems[oldSelectedIndex].root.removeChild(dropdownObject.htmlItems[oldSelectedIndex].check);
			}
			let check = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			check.setAttribute("viewBox", "0 0 24 24");
			check.innerHTML = "<path fill=\"currentColor\" d=\"M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z\"></path>";
			dropdownObject.htmlItems[index].root.appendChild(check);
			dropdownObject.htmlItems[index].check = check;

			for (let i = 0; i < dropdownObject.callbacks.length; i++) {
				dropdownObject.callbacks[i]();
			}
		};
		dropdownObject.RemoveItem = function(index, fallbackSelectedIndex) {
			if (index == dropdownObject.SelectedItemIndex) {
				dropdownObject.SetSelectedItemIndex(fallbackSelectedIndex);
			}
			dropdownObject.ItemList.splice(index, 1);
			dropdownObject.measure.removeChild(dropdownObject.htmlItems[index].root);
			dropdownObject.htmlItems.splice(index, 1);
			if (dropdownObject.Expanded) {
				dropdownObject.items.style.height = dropdownObject.measure.clientHeight + "px";
			}
		};
		dropdownObject.ChangeItemName = function(index, newName) {
			dropdownObject.ItemList[index] = newName;
			dropdownObject.htmlItems[index].text.innerText = newName;
			if (index == dropdownObject.SelectedItemIndex) {
				dropdownObject.label.innerText = dropdownObject.ItemList[index];
			}
			if (dropdownObject.Expanded) {
				dropdownObject.items.style.height = dropdownObject.measure.clientHeight + "px";
			}
		};
		dropdownObject.RegisterOnChangeCallback = function(callback) {
			if (dropdownObject.callbacks.indexOf(callback) == -1) {
				dropdownObject.callbacks.push(callback);
			}
		};
		dropdownObject.RemoveOnChangeCallback = function(callback) {
			dropdownObject.callbacks.splice(dropdownObject.callbacks.indexOf(callback), 1);
		};
		dropdownObject.SetAction = function(index, callback) {
			dropdownObject.htmlItems[index].action = callback;
		};
		dropdownObject.RemoveAction = function(index) {
			dropdownObject.htmlItems[index].action = null;
		};
		dropdownObject.OverrideText = function(text) {
			dropdownObject.label.innerText = text;
		}
		let itemsLength = items.length;
		for (let i = 0; i < itemsLength; i++) {
			//console.log(i);
			dropdownObject.AddItem(items[i]);
		}
		if (selectedItemIndex > -1) {
			dropdownObject.SetSelectedItemIndex(selectedItemIndex);
		}

		dropdownObject.root.addEventListener("mousedown", function(e) {
			if (!dropdownObject.Expanded) {
				dropdownObject.Expand();
				dropdownObject.expanding = true;
			}
		});
		document.body.addEventListener("mousedown", function() {
			if (!dropdownObject.expanding) {
				dropdownObject.Collapse();
			} else {
				dropdownObject.expanding = false;
			}
		});
		return dropdownObject;
	}

	window.draggable = {};
	draggable.new = function(element, callback) {
		let draggableObject = {};
		draggableObject.dragState = 0;
		draggableObject.offsetX = 0;
		draggableObject.offsetY = 0;
		draggableObject.el = element;
		draggableObject.clone = null;
		draggableObject.callback = callback;
		element.addEventListener("mousedown", function(e) {
			draggableObject.dragState = 1;
			let rect = draggableObject.el.getBoundingClientRect();
			draggableObject.offsetX = e.clientX - rect.x;
			draggableObject.offsetY = e.clientY - rect.y;
			e.preventDefault();
		});
		window.addEventListener("mouseup", function(e) {
			if (draggableObject.dragState > 0) {
				if (draggableObject.dragState == 2) {
					draggableObject.clone.style.animation = "opacityfadeout 0.5s ease";
					draggableObject.clone.style.opacity = 0;
					if (draggableObject.callback) {
						draggableObject.callback((e.clientX - draggableObject.offsetX) + draggableObject.el.clientWidth / 2, (e.clientY - draggableObject.offsetY) + draggableObject.el.clientHeight / 2);
					}
					window.setTimeout(function() {
						draggableObject.clone.remove();
						draggableObject.clone = null;
					}, 750);
				}
				draggableObject.dragState = 0;
				e.preventDefault();
			}
		});
		window.addEventListener("mousemove", function(e) {
			if (draggableObject.dragState > 0) {
				if (draggableObject.dragState == 1) {
					draggableObject.clone = draggableObject.el.cloneNode(true);
					draggableObject.clone.style.paddingTop = "0";
					draggableObject.clone.style.width = draggableObject.el.clientWidth;
					draggableObject.clone.style.height = draggableObject.el.clientHeight;
					draggableObject.clone.style.position = "absolute";
					draggableObject.clone.style.zIndex = 5;
					draggableObject.clone.style.boxShadow = "0px 0px 15px 5px rgb(0 0 0 / 37%)";
					draggableObject.clone.style.backgroundColor = "#EEEEEE";
					draggableObject.clone.style.transform = "translate(" + (e.clientX - draggableObject.offsetX) + "px, " + (e.clientY - draggableObject.offsetY) + "px)";
					draggableObject.clone.style.animation = "shadow 0.5s ease";

					document.body.appendChild(draggableObject.clone);
					draggableObject.dragState = 2;
				} else {
					//console.log("translate(" + (e.clientX - draggableObject.offsetX) + "px, " + (e.clientY - draggableObject.offsetY) + ")");
					draggableObject.clone.style.transform = "translate(" + (e.clientX - draggableObject.offsetX) + "px, " + (e.clientY - draggableObject.offsetY) + "px)";
				}
				e.preventDefault();
			}
		});
		return draggableObject;
	};

	let setButtonState = function(button, selected) {
		if (selected) {
			button.classList.add("iconitem-selected");
		} else {
			button.classList.remove("iconitem-selected");
		}
	};

	let setControlButtonState = function(button, selected) {
		if (selected) {
			button.classList.add("controlbutton-selected");
		} else {
			button.classList.remove("controlbutton-selected");
		}
	}

	window.ui.selectbutton = document.getElementById("ui-select");
	window.ui.panbutton = document.getElementById("ui-pan");
	window.ui.infobox = document.getElementById("ui-infobox");
	window.ui.closeinfobox = document.getElementById("ui-closeinfobox");
	window.ui.expandinfobox = document.getElementById("ui-expandinfobox");
	window.ui.gridtoggle = document.getElementById("ui-gridtoggle");
	window.ui.content = document.getElementById("ui-content");
	window.ui.logicpicker = document.getElementById("ui-logicpicker");
	window.ui.docksidebutton = document.getElementById("ui-dockside");
	window.ui.docklefticon = document.getElementById("ui-docklefticon");
	window.ui.dockrighticon = document.getElementById("ui-dockrighticon")
	ui.selectbutton.addEventListener("click", function() {
		tools.select.switch();
		setButtonState(ui.selectbutton, true);
		setButtonState(ui.panbutton, false);
	});
	ui.panbutton.addEventListener("click", function() {
		tools.pan.switch();
		setButtonState(ui.selectbutton, false);
		setButtonState(ui.panbutton, true);
	});
	ui.closeinfobox.addEventListener("click", function() {
		ui.infobox.style.right = "-325px";
		ui.expandinfobox.style.right = "-50px";
	});
	ui.expandinfobox.addEventListener("click", function() {
		ui.infobox.style.right = "40px";
		ui.expandinfobox.style.right = "-150px";
	});
	ui.gridtoggle.addEventListener("click", function() {
		if (workspace.gridEnabled) {
			setControlButtonState(ui.gridtoggle, false);
			workspace.gridEnabled = false;
		} else {
			setControlButtonState(ui.gridtoggle, true);
			workspace.gridEnabled = true;
		}
		workspace.redraw();
	});
	ui.docksidebutton.addEventListener("click", function() {
		document.body.classList.toggle("body-dockleft");
		document.body.classList.toggle("body-dockright");
		ui.content.classList.toggle("content-dockleft");
		ui.content.classList.toggle("content-dockright");
		ui.logicpicker.classList.toggle("content-dockleft");
		ui.logicpicker.classList.toggle("logicpicker-dockright");
		ui.docklefticon.classList.toggle("hidden");
		ui.dockrighticon.classList.toggle("hidden");
		if (ui.dockside == "left") {
			ui.dockside = "right";
		} else {
			ui.dockside = "left";
		}
	});
	//let canvas = document.getElementById("canvas");
	workspace.resize();

	window.addEventListener("resize", function(e) {
		workspace.resize();
	});

	document.body.addEventListener("keydown", function(e) {
		if (event.code == "KeyS") {
			tools.select.switch();
			setButtonState(ui.selectbutton, true);
			setButtonState(ui.panbutton, false);
		} else if (event.code == "KeyP") {
			tools.pan.switch();
			setButtonState(ui.selectbutton, false);
			setButtonState(ui.panbutton, true);
		}
	});

	let dropgate = function(x, y, gatetype) {
		let canvasRect = workspace.canvas.getBoundingClientRect();
		x = x - canvasRect.x;
		y = y - canvasRect.y;
		if (x >= 0 && y >= 0) {
			let graphPoint = workspace.displayPointToGraphPoint(x, y);
			let andgate = gatetype.new();
			andgate.x = graphPoint.x;
			andgate.y = graphPoint.y;
			workspace.currentgraph.objects.push(andgate);
			workspace.redraw();
		}
	}

	window.ui.andDraggable = draggable.new(document.getElementById("ui-and"), function(x, y) {
		dropgate(x, y, logic.andgate);
	});
	window.ui.orDraggable = draggable.new(document.getElementById("ui-or"), function(x, y) {
		dropgate(x, y, logic.orgate);
	});
	window.ui.xorDraggable = draggable.new(document.getElementById("ui-xor"), function(x, y) {
		dropgate(x, y, logic.xorgate);
	});
	window.ui.notDraggable = draggable.new(document.getElementById("ui-not"), function(x, y) {
		dropgate(x, y, logic.notgate);
	});
	window.ui.nandDraggable = draggable.new(document.getElementById("ui-nand"), function(x, y) {
		dropgate(x, y, logic.nandgate);
	});
	window.ui.norDraggable = draggable.new(document.getElementById("ui-nor"), function(x, y) {
		dropgate(x, y, logic.norgate);
	});
	window.ui.xnorDraggable = draggable.new(document.getElementById("ui-xnor"), function(x, y) {
		dropgate(x, y, logic.xnorgate);
	});

	window.ui.onDraggable = draggable.new(document.getElementById("ui-on"));
	window.ui.offDraggable = draggable.new(document.getElementById("ui-off"));
	window.ui.switchDraggable = draggable.new(document.getElementById("ui-switch"));
	window.ui.clockDraggable = draggable.new(document.getElementById("ui-clock"));

	window.ui.lightDraggable = draggable.new(document.getElementById("ui-light"));
	window.ui.sevensegDraggable = draggable.new(document.getElementById("ui-7seg"));

	window.ui.editingDropdown = dropdown.new(document.getElementById("editingDropdown"), ["Main graph", "New user-defined component..."], 0);
	ui.editingDropdown.SetAction(1, function() {});

	window.ui.bookmarksDropdown = dropdown.new(document.getElementById("bookmarksDropdown"), ["Origin", "New bookmark..."], -1);
	ui.bookmarksDropdown.OverrideText("Bookmarks...");
	ui.bookmarksDropdown.SetAction(0, function() {});
	ui.bookmarksDropdown.SetAction(1, function() {});
})();
