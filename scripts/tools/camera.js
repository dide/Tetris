define([ "tools/three.require", "tools/container" ], function(THREE, container) {
	var camera = new THREE.PerspectiveCamera(70, container.offsetWidth
			/ container.offsetHeight, 1, 10000);
	camera.position.set(0, -700, 450);

	camera.lookAt(new THREE.Vector3(0, 7000, 0));

	function onWindowResize() {

		camera.aspect = container.offsetWidth / container.offsetHeight;
		camera.updateProjectionMatrix();

	}

	window.addEventListener('resize', onWindowResize, false);

	onWindowResize();
	return camera;
});