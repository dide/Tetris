var myContainer;

define([], function() {

	if (!myContainer) {
		myContainer = document.createElement('div');
		document.body.appendChild(myContainer);
		myContainer.className = "container";
	}

	return myContainer;
});