define([ "../tools/Event" ], function(Event) {
	return {
		newInstance : function(ScreenScale) {
			return new VueDialog(DynamicStyles.getInstance(), ScreenScale,
					Event);
		}
	};
});

function VueDialog(dynamicStyles, ScreenScale, Event) {

	var panel = document.createElement("div");
	panel.className = "accueil";
	panel.style.opacity = "0";
	document.body.appendChild(panel);

	var stopScrollTouch = document.createElement("div");
	stopScrollTouch.className = "touchEvents";
	panel.appendChild(stopScrollTouch);

	var dialogBox = document.createElement("div");
	dialogBox.className = "dialog";
	panel.appendChild(dialogBox);

	var question = document.createElement("div");
	dialogBox.appendChild(question);

	var form = document.createElement("form");
	dialogBox.appendChild(form);

	var reponse = document.createElement("input");
	reponse.tyle = "text";
	form.appendChild(reponse);

	var hiddenOkButton = document.createElement("input");
	hiddenOkButton.type = "submit";
	hiddenOkButton.style.display = "none";
	form.appendChild(hiddenOkButton);

	var okButton = document.createElement("div");
	okButton.innerHTML = "OK";
	okButton.className = "button";
	dialogBox.appendChild(okButton);

	var annulerButton = document.createElement("div");
	annulerButton.innerHTML = "Cancel";
	annulerButton.className = "button";
	dialogBox.appendChild(annulerButton);

	var show = function() {
		panel.style.opacity = null;
		panel.style.zIndex = 14;
	};

	var canRestart = true;
	var hide = function(endTransformationHandler) {
		panel.style.opacity = "0";

		window.setTimeout(function() {
			panel.style.zIndex = null;
			canRestart = true;
			if (endTransformationHandler)
				endTransformationHandler();
		}, 600);
	};

	var responseHandler = null;

	this.prompt = function(strQuestion, handler) {
		responseHandler = function(data) {
			handler(data);
			reponse.value = "";
		};
		reponse.style.display = null;
		question.innerHTML = strQuestion;
		this.resize();
		show();
		reponse.focus();
	};

	this.confirm = function(strQuestion, handler) {
		responseHandler = function(data) {
			handler(data != null);
			reponse.value = "";
		};
		reponse.style.display = "none";
		reponse.value = "Une valeur quelconque";
		question.innerHTML = strQuestion;
		this.resize();
		show();
	};

	Event.addClickEventListener(okButton, function(event) {
		responseHandler(reponse.value.length > 0 ? reponse.value : null);
		reponse.blur();
		hide();
	});

	form.addEventListener("submit", function(event) {
		event.preventDefault();
		responseHandler(reponse.value.length > 0 ? reponse.value : null);
		hide();
		reponse.blur();
		return false;
	});

	Event.addClickEventListener(annulerButton, function(event) {
		responseHandler(null);
		hide();
	});

	this.resize = function() {
		var unite = ScreenScale.getUnite();
		var dimensions = ScreenScale.getDimensions();

		dynamicStyles.set(".dialog", "margin-left",
				dimensions.dialog.marginLeft + "px");

		dynamicStyles.set(".dialog", "width", dimensions.dialog.width + "px");

		dynamicStyles.set(".dialog", "margin-top",
				(-dialogBox.offsetHeight / 2) + "px");

	};

	window.addEventListener('resize', this.resize, false);
}
