define([ "tools/three.require", "tools/container", "detector" ], function(THREE, container,
		Detector) {
	container.innerHTML = "";
	var renderer;

	if (Detector.webgl)
		renderer = new THREE.WebGLRenderer();
	else
		renderer = new THREE.CanvasRenderer();

	// renderer.setClearColor(0xf0f0f0);
	// renderer.setClearColor(0x555555);
	renderer.setClearColor(0x000000);
	renderer.setSize(container.offsetWidth, container.offsetHeight);
	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;

	container.appendChild(renderer.domElement);

	renderer.dideUpdateSize = function() {
		renderer.setSize(container.offsetWidth, container.offsetHeight);
	};
	window.addEventListener('resize', renderer.dideUpdateSize, false);
	renderer.dideUpdateSize();

	return renderer;
});