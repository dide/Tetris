define([], function() {
	return {
		get : function(storage) {
			return new Config(storage);
		}
	};
});

function Config(storage){
	
	this.value = "on";
	
	if (storage.length == 0)
		storage.push(this);
	
	this.isMusicOn = function(){
		return storage[0].value == "on";
	};
	
	this.musicSwitchOff = function() {
		if (storage[0].value == "on")
			storage[0].value = "off";
		else
			storage[0].value = "on";
	};
}