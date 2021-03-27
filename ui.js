(function() {
	window.ui = {};
	window.ui.currentTool = "select";

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
	draggable.new = function(element) {
		let draggableObject = {};
		draggableObject.dragState = 0;
		draggableObject.offsetX = 0;
		draggableObject.offsetY = 0;
		draggableObject.el = element;
		draggableObject.clone = null;
		element.addEventListener("mousedown", function(e) {
			draggableObject.dragState = 1;
			let rect = draggableObject.el.getBoundingClientRect();
			draggableObject.offsetX = e.clientX - rect.x;
			draggableObject.offsetY = e.clientY - rect.y;
			e.preventDefault();
		});
		document.body.addEventListener("mouseup", function(e) {
			if (draggableObject.dragState > 0) {
				if (draggableObject.dragState == 2) {
					draggableObject.clone.style.animation = "opacityfadeout 0.5s ease";
					draggableObject.clone.style.opacity = 0;
					window.setTimeout(function() {
						draggableObject.clone.remove();
						draggableObject.clone = null;
					}, 750);
				}
				draggableObject.dragState = 0;
				e.preventDefault();
			}
		});
		document.body.addEventListener("mousemove", function(e) {
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

	document.body.onload = function() {
		window.ui.selectbutton = document.getElementById("ui-select");
		window.ui.panbutton = document.getElementById("ui-pan");
		ui.selectbutton.addEventListener("click", function() {
			window.ui.currentTool = "select";
			setButtonState(ui.selectbutton, true);
			setButtonState(ui.panbutton, false);
		});
		ui.panbutton.addEventListener("click", function() {
			window.ui.currentTool = "pan";
			setButtonState(ui.selectbutton, false);
			setButtonState(ui.panbutton, true);
		});

		document.body.addEventListener("keydown", function(e) {
			if (event.code == "KeyS") {
				window.ui.currentTool = "select";
				setButtonState(ui.selectbutton, true);
				setButtonState(ui.panbutton, false);
			} else if (event.code == "KeyP") {
				window.ui.currentTool = "pan";
				setButtonState(ui.selectbutton, false);
				setButtonState(ui.panbutton, true);
			}
		});

		window.ui.andDraggable = draggable.new(document.getElementById("ui-and"));
		window.ui.orDraggable = draggable.new(document.getElementById("ui-or"));
		window.ui.xorDraggable = draggable.new(document.getElementById("ui-xor"));
		window.ui.notDraggable = draggable.new(document.getElementById("ui-not"));
		window.ui.nandDraggable = draggable.new(document.getElementById("ui-nand"));
		window.ui.norDraggable = draggable.new(document.getElementById("ui-nor"));
		window.ui.xnorDraggable = draggable.new(document.getElementById("ui-xnor"));

		window.ui.onDraggable = draggable.new(document.getElementById("ui-on"));
		window.ui.offDraggable = draggable.new(document.getElementById("ui-off"));
		window.ui.switchDraggable = draggable.new(document.getElementById("ui-switch"));
		window.ui.clockDraggable = draggable.new(document.getElementById("ui-clock"));

		window.ui.lightDraggable = draggable.new(document.getElementById("ui-light"));
		window.ui.sevensegDraggable = draggable.new(document.getElementById("ui-7seg"));

		window.ui.editingDropdown = dropdown.new(document.getElementById("editingDropdown"), ["Main graph", "New user-defined block..."], 0);
		ui.editingDropdown.SetAction(1, function() {});

		window.ui.bookmarksDropdown = dropdown.new(document.getElementById("bookmarksDropdown"), ["Origin", "New bookmark..."], -1);
		ui.bookmarksDropdown.OverrideText("Bookmarks...");
		ui.bookmarksDropdown.SetAction(0, function() {});
		ui.bookmarksDropdown.SetAction(1, function() {});
	};
})();
