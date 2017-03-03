({
	
	baseUrl : ".",
	shim: {
		"threeLib" : {
			exports : "THREE"
		},

		"orbitControls" : {
			deps: [ "tools/three" ]
			
		},
		'tools/InterfaceHelper' : {
			deps: [ "requireLib" ]
		},
		"detector" : {
			// deps: [ "threeCore" ],
			
			exports : "Detector"
		}, "tools/three.require" : {
			exports : "THREE"
		}
	},
	
	paths: {
		"requireLib": "tools/require",
		"threeLib": "tools/three",
		"detector" : "tools/Detector",
        "orbitControls" : "tools/OrbitControls",
    },
    
	name : "tetr.3d",
	out : "tetr.3d.bin.js",
	optimize: "uglify"
	//optimize: "none"
})