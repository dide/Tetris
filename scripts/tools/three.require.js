
var loadedTHREE;

try {
	loadedTHREE = THREE;
} catch(e){
	console.log("Loading three AMD");
}

// As THREE.js comes with many addons/plugins mix them all into one three object here
define([ "tools/three", "orbitControls" ], function(threeCore) {
	THREE = threeCore?threeCore:loadedTHREE;
	return THREE;
});