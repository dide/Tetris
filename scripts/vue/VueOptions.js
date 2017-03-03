define([ "../tools/Event" ], function(Event) {
	return {
		newInstance : function(presenter, ScreenScale) {
			return new VueOptions(document.body, DynamicStyles.getInstance(),
					presenter, ScreenScale, Event);
		}
	};
});

function VueBoutton(label, className, node) {
	var button = document.createElement("div");
	node.appendChild(button);
	button.className = "button " + className;
	button.innerHTML = label;

	this.addEventListener = function(strEventName, handler, bPropagate) {
		button.addEventListener(strEventName, handler, bPropagate);
	};
}

function VueOption(label, node) {
	this.option = document.createElement("div");
	node.appendChild(this.option);
	this.option.innerHTML = "<div>" + label + "</div>";

	this.val = function() {
		throw new Error("To be implemented by inheritance");
	};
}

function VueOptionCheckBox(label, node, switcher, Event) {
	VueOption.call(this, label, node);
	var that = this;

	var checkBox = document.createElement("div");
	this.option.appendChild(checkBox);
	checkBox.className = "checkbox";

	var text = document.createElement("span");
	checkBox.appendChild(text);
	text.innerHTML = "On";
	var value = true;

	var icone = document.createElement("div");
	checkBox.appendChild(icone);

	Event.addClickEventListener(checkBox, function(event) {
		that.val(!value);
		switcher(value);
	});

	this.val = function(newvalue) {
		value = newvalue;
		if (value) {
			text.innerHTML = "On";
			icone.style.backgroundColor = null;
		} else {
			text.innerHTML = "Off";
			icone.style.backgroundColor = "red";
		}
	};
}

VueOptionCheckBox.prototype = Object.create(VueOption.prototype);

function VueOptionBoutton(label, node, handler, Event) {
	VueOption.call(this, label[0], node);

	var boutton = new VueBoutton(label[1], "go", this.option);

	Event.addClickEventListener(boutton, handler);

	this.val = function() {

	};
}

VueOptionBoutton.prototype = Object.create(VueOption.prototype);

function VueOptions(node, dynamicStyles, presenter, ScreenScale, Event) {

	var options = document.createElement("div");
	options.className = "fenetre";
	node.appendChild(options);

	var musicCheckBox = null;

	this.open = function(closeHandler) {

		options.innerHTML = "";
		var h2 = document.createElement("h2");
		options.appendChild(h2);
		h2.innerHTML = "Options";

		var closeButton = new VueBoutton("X", "close", options);

		var close = function() {
			options.style.opacity = null;
			options.style.top = null;
			if (closeHandler)
				closeHandler();
		};

		Event.addClickEventListener(closeButton, close);

		options.style.top = "50%";
		options.style.opacity = 1;

		var content = document.createElement("div");
		options.appendChild(content);
		content.className = "content";

		musicCheckBox = new VueOptionCheckBox("Music", content, function() {
			presenter.musicSwitchOff();
		}, Event);
		new VueOptionBoutton([ "Best Scores", "Delete" ], content, function() {
			presenter.confirm("Delete the<br />best scores?", function(data) {
				if (data)
					presenter.emptyHighScore();
			});
		}, Event);

		new VueOptionBoutton([ "Cr&eacute;dits", "View" ], content, function() {
			presenter.viewCredits();
			close();
		}, Event);
	};

	this.musicSetValue = function(value) {
		musicCheckBox.val(value);
	};

	this.resize = function() {
		var unite = ScreenScale.getUnite();

		dynamicStyles.set(".fenetre", "margin-left", (-7.625 * unite) + "px");

		dynamicStyles.set(".fenetre", "margin-top", (-10 * unite) + "px");

		dynamicStyles.set(".fenetre", "height", (20 * unite) + "px");

		dynamicStyles.set(".fenetre", "width", (15.25 * unite) + "px");
	};

	window.addEventListener('resize', this.resize, false);
	this.resize();
}