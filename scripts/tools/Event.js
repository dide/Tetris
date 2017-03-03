define([], function() {
	return {
		addClickEventListener : Event.addClickEventListener
	};
});

function Event() {

}

Event.isTouchSupported = function() {
	return 'ontouchstart' in window;
};

Event.addClickEventListener = function(node, handler) {
	return new ClickEvent(node, handler);
};

function ClickEvent(node, handler) {
	Event.call(this);

	if (Event.isTouchSupported()) {
		var startx = -1;
		var starty = -1;

		node.addEventListener("touchstart", function(event) {
			var touchobj = event.changedTouches[0];
			startx = touchobj.clientX;
			starty = touchobj.clientY;
		});

		node.addEventListener("touchend", function(event) {
			var touchobj = event.changedTouches[0];
			var endx = touchobj.clientX;
			var endy = touchobj.clientY;

			if (Math.sqrt((startx - endx) * (startx - endx) + (starty - endy)
					* (starty - endy)) < 2) {
				handler(event);
			}
		});

	} else {
		node.addEventListener("click", handler);
	}

}
ClickEvent.prototype = Object.create(Event.prototype);
