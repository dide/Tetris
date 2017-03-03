define(function() {
	return {
		addInput : function(libelle, clickHandler) {
			var input = document.createElement("input");
			input.type = "button";
			input.value = libelle;
			document.body.appendChild(input);
			input.addEventListener("click", clickHandler);
		}
	};
});