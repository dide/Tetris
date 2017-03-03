define([], function() {
	return {
		newInstance : function(inputArray) {
			return new SyncArray(inputArray);
		},
		addSyncProperties : SyncArray.addSyncProperties
	};
});

function SyncArray(inputArray) {
	for (var i = 0; i < inputArray.length; i++) {
		this.addTrigger(inputArray[i]);
		this.push(inputArray[i]);
	}
}

SyncArray.prototype = new Array;

SyncArray.prototype.addTrigger = function(obj) {
	var that = this;
	for ( var prop in obj) {
		if (prop != "length") {
			obj.trigger(prop, function(prop, newval) {
				var event = {
					key : 'update',
					'field' : prop,
					'newval' : newval,
					'target' : [ this ]
				};
				that.dispatchEvent(event);
				return newval;
			});
		}
	}
};

SyncArray.prototype.addEventListener = function(id, handler) {
	if (!this.listeners)
		this.listeners = [];

	if (!this.listeners[id])
		this.listeners[id] = [];

	this.listeners[id].push(handler);
};

SyncArray.prototype.removeEventLister = function(id, handler) {
	if (!this.listeners)
		return;

	var index = this.listeners[id].indexOf(handler);
	this.listeners[id].splice(index, 1);
};

SyncArray.prototype.dispatchEvent = function(event) {
	if (!this.listeners)
		return;

	var length = this.listeners[event.key] ? this.listeners[event.key].length
			: 0;
	for (var i = 0; i < length; i++) {
		if (!this.listeners[event.key][i](event))
			break;
	}
};

SyncArray.prototype.push = function() {
	var result = Array.prototype.push.apply(this, arguments);

	for (var i = 0; i < arguments.length; i++) {
		this.addTrigger(arguments[i]);
	}

	var event = {
		key : 'insert',
		'values' : arguments,
		'target' : [ this ]
	};
	this.dispatchEvent(event);

	return result;
};

SyncArray.prototype.splice = function() {

	var index = arguments[0];
	var length = arguments[1];

	var insertedObjects = [];
	for (var i = 2; i < arguments.length; i++) {
		insertedObjects.push(arguments[i]);
		this.addTrigger(arguments[i]);
	}

	var deletedObjects = [];
	for (var i = index; i < index + length; i++) {
		deletedObjects.push(this[i]);
		for ( var prop in this[i]) {
			if (prop != "length") {
				this[i].untrigger(prop);
			}
		}
	}

	var result = Array.prototype.splice.apply(this, arguments);

	var event = {
		key : 'insert',
		'values' : insertedObjects,
		'target' : [ this ]
	};
	if (insertedObjects.length > 0)
		this.dispatchEvent(event);

	event = {
		key : 'delete',
		'values' : deletedObjects,
		'target' : [ this ]
	};
	if (deletedObjects.length > 0)
		this.dispatchEvent(event);

	return result;
};

SyncArray.ChangeEvent = function() {

};

SyncArray.UPDATE = new SyncArray.ChangeEvent();
SyncArray.INSERT = new SyncArray.ChangeEvent();
SyncArray.DELETE = new SyncArray.ChangeEvent();

SyncArray.addSyncProperties = function(myArray) {
	if (myArray.addEventListener)
		return;
	
	myArray.__proto__ = Object.create(SyncArray.prototype);

	for (var i = 0; i < myArray.length; i++) {
		myArray.addTrigger(myArray[i]);
	}
};

Object.defineProperty(Object.prototype, "trigger", {
	enumerable : false,
	configurable : true,
	writable : false,
	value : function(prop, handler) {
		var newval = this[prop], getter = function() {
			return newval;
		}, setter = function(val) {
			newval = val;
			handler.call(this, prop, val);
			return val;
		};

		if (delete this[prop]) { // can't watch constants
			Object.defineProperty(this, prop, {
				get : getter,
				set : setter,
				enumerable : true,
				configurable : true
			});
		}
	}
});

Object.defineProperty(Object.prototype, "untrigger", {
	enumerable : false,
	configurable : true,
	writable : false,
	value : function(prop) {
		var val = this[prop];
		delete this[prop]; // remove accessors
		this[prop] = val;
	}
});

/*
 * object.watch polyfill
 * 
 * 2012-04-03
 * 
 * By Eli Grey, http://eligrey.com Public Domain. NO WARRANTY EXPRESSED OR
 * IMPLIED. USE AT YOUR OWN RISK. https://gist.github.com/eligrey/384583
 */
// object.watch
if (!Object.prototype.watch) {
	Object.defineProperty(Object.prototype, "watch", {
		enumerable : false,
		configurable : true,
		writable : false,
		value : function(prop, handler) {
			var oldval = this[prop], newval = oldval, getter = function() {
				return newval;
			}, setter = function(val) {
				oldval = newval;
				return newval = handler.call(this, prop, oldval, val);
			};

			if (delete this[prop]) { // can't watch constants
				Object.defineProperty(this, prop, {
					get : getter,
					set : setter,
					enumerable : true,
					configurable : true
				});
			}
		}
	});
}

// object.unwatch
if (!Object.prototype.unwatch) {
	Object.defineProperty(Object.prototype, "unwatch", {
		enumerable : false,
		configurable : true,
		writable : false,
		value : function(prop) {
			var val = this[prop];
			delete this[prop]; // remove accessors
			this[prop] = val;
		}
	});
}
