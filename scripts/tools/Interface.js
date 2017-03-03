define(function() {
	return {
		newInstance : function(name, methods) {
			return new Interface(name, methods);
		}
	};
});

function Interface(name, methods) {
	this.name = name;
	this.methods = [];

	if (methods.constructor == Array)
		this.methods = methods;
	else if (methods.constructor == String)
		this.methods[0] = methods;
	else
		throw new Error(
				"Interface must define methods as a String or an Array of Strings");
};