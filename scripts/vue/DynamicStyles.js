define([], function() {
	return {
		getInstance : function() {
			return DynamicStyles.getInstance();
		}
	};
});

function DynamicStyles() {

	var dynamicStyle = document.createElement("style");
	document.head.appendChild(dynamicStyle);

	var styles = [];

	var updateDocument = function() {
		var buffer = [];
		for (var i = 0; i < styles.length; i++) {
			var objStyle = styles[i];
			if (!buffer[objStyle.getSelector()])
				buffer[objStyle.getSelector()] = [];

			buffer[objStyle.getSelector()].push(objStyle);
		}

		var result = "";

		for ( var regle in buffer) {
			result += regle + " {";
			for (var i = 0; i < buffer[regle].length; i++) {
				result += buffer[regle][i].getProperty();
			}

			result += "}\n";
		}

		dynamicStyle.innerHTML = result;
	};

	this.set = function(selector, propertyName, value) {

		var style = null;

		for (var i = 0; i < styles.length; i++) {
			var objStyle = styles[i];
			if (objStyle.getSelector() == selector
					&& objStyle.getPropertyName() == propertyName) {
				style = objStyle;
			}
		}

		if (!style) {
			style = new DynamicStyle(selector, propertyName, value);
			styles.push(style);
		}

		style.setValue(value);

		updateDocument();
	};
}

DynamicStyles.getInstance = function() {
	if (!DynamicStyles.instance)
		DynamicStyles.instance = new DynamicStyles();
	return DynamicStyles.instance;
};

function DynamicStyle(selector, propertyName, value) {

	this.getSelector = function() {
		return selector;
	};

	this.getPropertyName = function() {
		return propertyName;
	};

	this.setValue = function(sValue) {
		value = sValue;
	};

	this.getProperty = function() {
		return propertyName + ":" + value + ";";
	};
}