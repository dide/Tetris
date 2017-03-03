({
	
	baseUrl : ".",
	shim: {
		
	},
	
	paths: {
		"requireLib": "tools/require"
    },
    
	name : "tetr",
	out : "tetr.bin.js",
	generateSourceMaps : false,
	preserveLicenseComments  : false,
	optimize: "uglify2"
})