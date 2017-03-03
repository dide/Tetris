define([ "tools/SyncArray" ], function(SyncArray) {
	return {
		getInstance : function() {
			return StorageFactory.getInstance(SyncArray);
		}
	};
});

function StorageFactory(SyncArray) {
	if (!window.localStorage) {
		window.localStorage = {
			getItem : function(sKey) {
				if (!sKey || !this.hasOwnProperty(sKey)) {
					return null;
				}
				return unescape(document.cookie.replace(new RegExp(
						"(?:^|.*;\\s*)"
								+ escape(sKey).replace(/[\-\.\+\*]/g, "\\$&")
								+ "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
			},
			key : function(nKeyId) {
				return unescape(document.cookie
						.replace(/\s*\=(?:.(?!;))*$/, "").split(
								/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
			},
			setItem : function(sKey, sValue) {
				if (!sKey) {
					return;
				}
				document.cookie = escape(sKey) + "=" + escape(sValue)
						+ "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
				this.length = document.cookie.match(/\=/g).length;
			},
			length : 0,
			removeItem : function(sKey) {
				if (!sKey || !this.hasOwnProperty(sKey)) {
					return;
				}
				document.cookie = escape(sKey)
						+ "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
				this.length--;
			},
			hasOwnProperty : function(sKey) {
				return (new RegExp("(?:^|;\\s*)"
						+ escape(sKey).replace(/[\-\.\+\*]/g, "\\$&")
						+ "\\s*\\=")).test(document.cookie);
			}
		};
		window.localStorage.length = (document.cookie.match(/\=/g) || window.localStorage).length;
	}

	this.newLocalStorage = function(sApplicationKey) {
		return new LocalStorage(sApplicationKey, SyncArray);
	};
}
StorageFactory.instance;

StorageFactory.getInstance = function(SyncArray) {
	if (!StorageFactory.instance) {
		StorageFactory.instance = new StorageFactory(SyncArray);
	}

	return StorageFactory.instance;
};

function Storage() {
	this.persist = function() {
		throw new Error("To be implemented by a subclass !");
	};
}
Storage.prototype = new Array;

function LocalStorage(sApplicationKey, SyncArray) {
	Storage.call(this);
	var that = this;

	this.getItem = function(key) {
		return JSON.parse(window.localStorage.getItem(key));
	};

	var localStorage = this.getItem(sApplicationKey);
	if (localStorage) {
		for (var i = 0; i < localStorage.length; i++) {
			this.push(localStorage[i]);
		}
	}

	SyncArray.addSyncProperties(this);

	this.setItem = function(key, value) {
		window.localStorage.setItem(key, JSON.stringify(value));
	};

	this.persist = function() {
		this.setItem(sApplicationKey, this);
	};

	this.addEventListener("update", function(event) {
		that.persist();
	});
	this.addEventListener("insert", function(event) {
		that.persist();
	});
	this.addEventListener("delete", function(event) {
		that.persist();
	});
}
LocalStorage.prototype = Object.create(Storage.prototype);
