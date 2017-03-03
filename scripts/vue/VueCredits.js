define([ "../tools/Event" ], function(Event) {
	return {
		newInstance : function(ScreenScale) {
			return new VueCredit(document.body, DynamicStyles.getInstance(),
					ScreenScale, Event);
		}
	};
});

function VueCreditStep(node, texte, tagName) {
	var that = this;

	var el = document.createElement(tagName);
	node.appendChild(el);
	el.innerHTML = texte;

	var top = null;

	this.resize = function() {
		el.style.marginLeft = (-el.offsetWidth / 2) + "px";
	};

	var unite;
	var endHandler;
	var nextVue;
	var stopped = true;

	this.move = function(newUnite) {
		unite = newUnite ? newUnite : unite;
		if (stopped)
			return;

		if (top === null) {
			top = document.body.offsetHeight + unite;
		}

		top -= unite;

		that.step(top, unite);

		if (top < -20 * unite) {
			top = null;
			if (nextVue) {
				window.setTimeout(function() {
					nextVue.move(unite);
				}, 400);
			}

			if (!nextVue && endHandler)
				endHandler();
		} else {
			window.setTimeout(that.move, 400);
		}
	};

	this.end = function(handler) {
		endHandler = handler;
	};

	this.step = function(newtop, unite) {
		top = newtop;
		el.style.top = top + "px";

		if (nextVue) {
			nextVue.step(
					top + el.offsetHeight + that.getMarginBottom() * unite,
					unite);
		}
	};

	this.getMarginBottom = function() {
		throw new Error("To be implemented by inheritance");
	};

	this.chain = function(next) {
		nextVue = next;
	};

	this.stop = function() {
		stopped = true;
	};

	this.start = function(unite) {
		stopped = false;

		if (nextVue)
			nextVue.start(unite);
	};
}

function VueCreditTitre(node, texte) {
	VueCreditStep.call(this, node, texte, "h1");

	this.getMarginBottom = function() {
		return 2;
	};
}
VueCreditTitre.prototype = Object.create(VueCreditStep.prototype);

function VueCreditText(node, texte) {
	VueCreditStep.call(this, node, texte, "p");

	this.getMarginBottom = function() {
		return 1;
	};
}
VueCreditText.prototype = Object.create(VueCreditStep.prototype);

function VueCredit(node, dynamicStyles, ScreenScale, Event) {

	var textes = [];

	this.open = function(closeHandler) {

		var credits = document.createElement("div");
		credits.className = "credits";
		node.appendChild(credits);

		var clicked = false;

		var close = function() {
			if (clicked)
				return;

			clicked = true;
			credits.style.opacity = "0";
			for (var i = 0; i < textes.length - 1; i++) {
				textes[i].stop();
			}
			textes = [];
			window.setTimeout(function() {
				node.removeChild(credits);
				closeHandler();
			}, 1000);
		};
		Event.addClickEventListener(credits, close);

		var stopScrollTouch = document.createElement("div");
		stopScrollTouch.className = "touchEvents";
		credits.appendChild(stopScrollTouch);

		textes.push(new VueCreditTitre(credits, "Developer"));
		textes.push(new VueCreditText(credits, "Geneva Dide"));

		textes.push(new VueCreditTitre(credits, ""));
		textes.push(new VueCreditTitre(credits, "Jamendo<br />artists"));
		textes.push(new VueCreditText(credits, "Mic"));
		textes.push(new VueCreditText(credits, "VIP-ZIK"));
		textes.push(new VueCreditText(credits, "al_sub"));
		textes.push(new VueCreditTitre(credits, ""));
		textes.push(new VueCreditTitre(credits, ""));
		textes.push(new VueCreditTitre(credits, ""));
		textes.push(new VueCreditTitre(credits, ""));
		textes.push(new VueCreditTitre(credits, "Thank you!"));

		for (var i = 0; i < textes.length - 1; i++) {
			textes[i].chain(textes[i + 1]);
		}

		this.resize();

		textes[0].start(ScreenScale.getUnite());
		textes[0].move(ScreenScale.getUnite());
		textes[textes.length - 1].end(close);
	};

	this.resize = function() {
		for (var i = 0; i < textes.length; i++) {
			textes[i].resize();
		}
	};

	window.addEventListener('resize', this.resize, false);
}