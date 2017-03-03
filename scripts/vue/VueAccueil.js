define([ "vue/DynamicStyles", "../tools/Event" ],
		function(DynamicStyles, Event) {
			return {
				newInstance : function(presenter, ScreenScale) {
					return new VueAccueil(presenter, ScreenScale,
							DynamicStyles, Event);
				}
			};
		});

function VueAccueil(presenter, ScreenScale, DynamicStyles, Event) {

	var panel = document.createElement("div");
	panel.className = "accueil";
	document.body.appendChild(panel);

	var stopScrollTouch = document.createElement("div");
	stopScrollTouch.className = "touchEvents";
	panel.appendChild(stopScrollTouch);

	var stopTouchEvent = function(e) {
		e.preventDefault();
	};
	stopScrollTouch.addEventListener('touchstart', stopTouchEvent, false);

	stopScrollTouch.addEventListener('touchmove', stopTouchEvent, false);

	stopScrollTouch.addEventListener('touchend', stopTouchEvent, false);

	var gameOverTitle = document.createElement("span");
	gameOverTitle.innerHTML = "Tetris";
	panel.appendChild(gameOverTitle);

	var jouer = document.createElement("div");
	panel.appendChild(jouer);
	jouer.className = "button jouer";
	jouer.innerHTML = "Start";

	var dynamicStyles = DynamicStyles.getInstance();
	var options = document.createElement("div");
	panel.appendChild(options);
	options.className = "button options";
	options.innerHTML = "Options";

	var canRestart = true;

	Event.addClickEventListener(options, function(event) {
		if (canRestart) {
			canRestart = false;
			presenter.openOptionsScreen(function() {
				canRestart = true;
			});
		}
	});

	var jouerAction;

	Event.addClickEventListener(jouer, function(event) {
		if (canRestart) {
			canRestart = false;
			if (!jouerAction)
				presenter.restart();
			else
				jouerAction();
		}
		hide();
	});

	var vueTableau = new VueTableau(panel);

	this.emptyHighScore = function() {
		vueTableau.remove();
		vueTableau = new VueTableau(panel);
	};

	var hide = function(endTransformationHandler) {
		panel.style.opacity = "0";

		window.setTimeout(function() {
			panel.style.zIndex = null;
			canRestart = true;
			if (endTransformationHandler)
				endTransformationHandler();
		}, 600);
	};

	var show = function() {
		panel.style.opacity = null;
		panel.style.zIndex = 12;
	};

	this.afficheHighScore = function(datas) {
		vueTableau.replaceData(datas[0]);
	};

	show();

	this.lost = function() {
		jouerAction = null;
		jouer.innerHTML = "Restart";
		gameOverTitle.innerHTML = "Game Over !";
		this.resize();
		show();
	};

	this.resume = function(resumeHandler) {
		jouerAction = resumeHandler;
		jouer.innerHTML = "Resume";
		gameOverTitle.innerHTML = "Tetr";
		this.resize();
		show();
	};

	this.resize = function() {
		var unite = ScreenScale.getUnite();

		dynamicStyles.set(".accueil>.button.jouer", "margin-left",
				(-jouer.offsetWidth / 2) + "px");

		dynamicStyles.set(".accueil>.button.jouer", "margin-top",
				(-6.5 * unite - jouer.offsetHeight / 2) + "px");

		dynamicStyles.set(".accueil>.button.options", "margin-left",
				(-options.offsetWidth / 2) + "px");

		dynamicStyles.set(".accueil>.button.options", "margin-top", (-4.5
				* unite - options.offsetHeight / 2)
				+ "px");

		dynamicStyles.set(".accueil>span", "margin-left",
				(-gameOverTitle.offsetWidth / 2) + "px");

		dynamicStyles.set(".accueil>span", "margin-top",
				(-9 * unite - gameOverTitle.offsetHeight / 2) + "px");
	};

	window.addEventListener('resize', this.resize, false);
	this.resize();
}

function VueTableau(node, array) {

	var table = document.createElement("table");
	node.appendChild(table);
	table.style.display = "none";

	var title;

	var thead = null;
	var tfooter = null;
	var trs = [];

	this.splice = function(index, nb, newItems) {
		var hasContent = !thead && newItems && newItems.length > 0;
		if (hasContent) {
			table.style.display = null;

			var titleTr = document.createElement("tr");
			table.appendChild(titleTr);
			title = document.createElement("th");
			titleTr.appendChild(title);
			title.innerHTML = newItems.title;

			var length = 0;

			thead = document.createElement("tr");
			tfooter = document.createElement("tr");
			var footerTd = document.createElement("td");
			tfooter.appendChild(footerTd);

			table.appendChild(thead);

			for ( var head in newItems[0]) {
				if (head == "length")
					continue;

				length++;
				var th = document.createElement("th");
				thead.appendChild(th);
				th.innerHTML = head;
			}

			title.colSpan = length;
			footerTd.colSpan = length;

			table.appendChild(tfooter);
		}

		for (var i = index; i < index + nb; i++) {
			table.removeChild(trs[i]);
		}

		var childToInsertBefore = null;
		if (trs.length > index + nb)
			childToInsertBefore = trs[index + nb];

		var trNewItems = [];

		for (var i = 0; i < newItems.length; i++) {
			var tr = document.createElement("tr");
			trNewItems.push(tr);
			for ( var prop in newItems[i]) {
				var td = document.createElement("td");
				tr.appendChild(td);
				td.innerHTML = newItems[i][prop];
			}

			if (childToInsertBefore) {
				table.insertBefore(tr, childToInsertBefore);
			} else {
				table.insertBefore(tr, tfooter);
			}
		}

		trs.splice(index, nb);
		for (var i = trNewItems.length - 1; i >= 0; i--) {
			trs.splice(index, 0, trNewItems[i]);
		}
	};

	if (array) {
		title.innerHTML = array.title;
		this.splice(0, 0, array);
	}

	this.replaceData = function(data) {
		this.splice(0, trs.length, data);
	};

	this.remove = function() {
		node.removeChild(table);
	};
}
