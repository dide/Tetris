var InterfaceHelper = null;
var ViewPresenterInterface = null;
var Tools = null;
var Matrix = null;
var THREE = null;
var BOITE = null;

var camera, scene, projector, renderer;

require([ "tools/three" ]);

define([ "../tools/Tools", "../tools/Matrix", "../tools/scene",
		"tools/three.require", "../tools/renderer", "../tools/camera",
		"../tools/geometry", "../tools/controls", "../tools/boite.require" ],
		function(tools, matrix, scene, three, renderer, camera, geometry,
				controls, boite) {
			Tools = tools;
			Matrix = matrix;
			THREE = three;
			BOITE = boite;
			VuePlateau3D.CUBE_GEOMETRY = geometry.CUBE_GEOMETRY;

			function animate() {

				function render() {

					renderer.render(scene, camera);

				}

				requestAnimationFrame(animate);
				// controls.update();
				render();

			}

			return {
				newInstance : function(presenter) {
					var vue = new VuePlateau3D(presenter, scene);

					animate();

					return vue;
				}
			};
		});

function newLine(x0, y0, x1, y1, material) {
	var geometry = new THREE.Geometry();
	geometry.vertices.push(new THREE.Vector3(x0, y0, 0));
	geometry.vertices.push(new THREE.Vector3(x1, y1, 0));

	return new THREE.Line(geometry, material);
}

function VuePlateau3D(presenter, scene) {
	var assignUVs = function(geometry) {

		geometry.computeBoundingBox();

		var max = geometry.boundingBox.max;
		var min = geometry.boundingBox.min;

		var offset = new THREE.Vector2(0 - min.x, 0 - min.y);
		var range = new THREE.Vector2(max.x - min.x, max.y - min.y);

		geometry.faceVertexUvs[0] = [];
		var faces = geometry.faces;

		for (i = 0; i < geometry.faces.length; i++) {

			var v1 = geometry.vertices[faces[i].a];
			var v2 = geometry.vertices[faces[i].b];
			var v3 = geometry.vertices[faces[i].c];

			geometry.faceVertexUvs[0].push([
					new THREE.Vector2((v1.x + offset.x) / range.x,
							(v1.y + offset.y) / range.y),
					new THREE.Vector2((v2.x + offset.x) / range.x,
							(v2.y + offset.y) / range.y),
					new THREE.Vector2((v3.x + offset.x) / range.x,
							(v3.y + offset.y) / range.y) ]);

		}

		geometry.uvsNeedUpdate = true;

	}

	var boiteMaterial = new THREE.MeshLambertMaterial({
		ambient : 0x404040,
		color : 0xae6de9
	});

	BOITE.geometry.computeFaceNormals();
	BOITE.geometry.computeVertexNormals();
	assignUVs(BOITE.geometry);

	var texture1 = THREE.ImageUtils.loadTexture("scripts/tools/texture.jpg");

	texture1.wrapS = texture1.wrapT = THREE.RepeatWrapping;
	texture1.repeat.set(1.1, 1.1);

	var material1 = new THREE.MeshPhongMaterial({
		color : 0xffffff,
		map : texture1
	});

	var boite = new THREE.Mesh(BOITE.geometry, material1);

	boite.position.z = -Style.RATIO * 3 / 2;
	boite.position.x = -Style.RATIO * 1 / 2;
	// boite.position.y = Style.RATIO * 1 / 2

	boite.scale.x = 10;
	boite.scale.y = 26;
	boite.scale.z = 20;
	boite.rotation.z = Math.PI / 2;

	boite.receiveShadow = true;

	scene.add(boite);

	// the light source
	var light = new THREE.DirectionalLight(0xaaaaaa);
	light.castShadow = true;
	light.position.set(100, -200, 1000); // set it light source to top-behind
	// the
	// cubes
	light.target = boite; // target the light to the large cube
	light.shadowCameraNear = 50;
	light.shadowCameraFar = 1150;

	light.shadowCameraRight = 250;
	light.shadowCameraLeft = -250;
	light.shadowCameraTop = 150;
	light.shadowCameraBottom = -10;

	// light.shadowCameraVisible = true;
	scene.add(light);

	light = new THREE.DirectionalLight(0xFFFFFF);
	light.position.set(0, -200, 0);
	light.target = boite;
	scene.add(light);

	/*
	 * var sunlight = new THREE.DirectionalLight(); sunlight.position.set(0, 0,
	 * 250); sunlight.intensity = 0.5; sunlight.castShadow = true;
	 * sunlight.shadowCameraVisible = true;
	 */
	/*
	 * sunlight.shadowCameraNear = 250; sunlight.shadowCameraFar = 600;
	 * sunlight.shadowCameraLeft = -200; sunlight.shadowCameraRight = 200;
	 * sunlight.shadowCameraTop = 200; sunlight.shadowCameraBottom = -200;
	 */
	// scene.add(sunlight);
	// scene.add( new THREE.AmbientLight( 0x404040 ) );
	/*
	 * for (var i = -100; i <= 100; i += 40) { scene.add(newLine(-1000, i, 1000,
	 * i, material)); } for (var i = -1000; i <= 1000; i += 40) {
	 * scene.add(newLine(i, -100, i, 100, material)); }
	 */

	// var controls = new THREE.OrbitControls(camera, renderer.domElement);
	// /////////////////////////////
	var vueLignes = new VueLignes();
	var vueProchainePiece = new VueProchainePiece();
	var vueScore = new VueScore();

	this.ajoutePiece = function(cubes) {

		var piece = vueProchainePiece.dessine(cubes, scene);

		if (piece != null) {
			vueLignes.ajoutePiece(piece.getVuesCarres());
			piece.dessine();
		}

		return piece;
	};

	this.efface = function(index, nombre) {
		vueLignes.efface(index, nombre);
	};

	this.updateScore = function(nbLignes, niveau, points) {
		vueScore.update(nbLignes, niveau, points);
	};

	document.body.addEventListener("keydown", function(event) {
		switch (event.keyCode) {
		case 32:
			presenter.prochainePiece(event);
			break;
		case 37:
			presenter.gauche(event);
			break;
		case 38:
			presenter.tourneHoraire(event);
			break;
		case 39:
			presenter.droite(event);
			break;
		case 40:
			presenter.bas(event);
			break;

		default:
			return;
		}
	});

	var startx = 0;
	var starty = 0;
	var touchDiv = document.createElement("div");
	var screenWidth = parseInt(window.screen.width);

	document.body.appendChild(touchDiv);
	touchDiv.className = "touchEvents";

	touchDiv.addEventListener('touchstart', function(e) {
		var touchobj = e.changedTouches[0]; // reference first touch point (ie:
		// first finger)
		startx = parseInt(touchobj.clientX); // get x position of touch point
		// relative to left edge of browser
		starty = parseInt(touchobj.clientY);
		e.preventDefault();
	}, false);

	touchDiv.addEventListener('touchmove', function(e) {
		var touchobj = e.changedTouches[0]; // reference first touch point for
		// this event
		var distX = parseInt(touchobj.clientX) - startx;
		var distY = parseInt(touchobj.clientY) - starty;

		if (distY > screenWidth / 8) {
			starty += screenWidth / 8;
			presenter.bas(event);
		} else if (distY < screenWidth / 20) {
			if (distX > screenWidth / 8) {
				startx += screenWidth / 8;
				presenter.droite(event);
			} else if (distX < -screenWidth / 8) {
				startx -= screenWidth / 8;
				presenter.gauche(event);
			}
		}

		e.preventDefault();
	}, false);

	touchDiv.addEventListener('touchend', function(e) {
		var touchobj = e.changedTouches[0]; // reference first touch point for
		// this event
		var distX = parseInt(touchobj.clientX) - startx;
		var distY = parseInt(touchobj.clientY) - starty;

		if (Math.abs(distX) < 1 && Math.abs(distY) < 1) {
			presenter.tourneHoraire(event);
		}

		e.preventDefault();
	}, false);

	this.lost = function(data) {
		var a = document.createElement("a");
		document.body.appendChild(a);
		a.innerHTML = "PERDU !!! (telecharger la partie)";
		a.href = "data:application/octet-stream;charset=utf-8;base64,"
				+ btoa(data);
		a.download = "partie.txt";
	};

	Tools.addInput("Pause", function(event) {
		presenter.pause(event);
	});

	window.setTimeout(function() {
		presenter.start();
	}, 1);

	this.toString = function() {
		return vueLignes.toString();
	};
}

function VuePiece(cubes, scene) {
	var vueCubes = [];

	this.getClassName = function() {
		var hash = "/";
		for (var i = 0; i < cubes.length; i++) {
			hash += cubes[i][0] + "" + cubes[i][1];
		}

		switch (hash) {
		case "/320420520620":
			return "Barre";
		case "/421521420520":
			return "Carre";
		case "/420520620621":
			return "L";
		case "/420520620421":
			return "LBar";
		case "/420520521621":
			return "S";
		case "/421521621520":
			return "T";
		case "/421521520620":
			return "Z";
		default:
			throw new Error("NYI");
			break;
		}
	};

	var className = this.getClassName();

	for (var i = 0; i < cubes.length; i++) {
		var cube = cubes[i];

		vueCubes.push(new VueCarre(cube[0], cube[1], scene, className));
	}

	this.deplace = function(matrice) {
		if (!matrice)
			return;

		for (var i = 0; i < vueCubes.length; i++) {
			var cube = vueCubes[i];

			cube.deplace(matrice);
		}
	};

	this.getVuesCarres = function() {
		return vueCubes;
	};

	this.dessine = function() {
		for (var i = 0; i < vueCubes.length; i++) {
			var cube = vueCubes[i];
			cube.dessine();
		}
	};
}

VuePiece.newInstance = function(cubes, scene) {
	return new VuePiece(cubes, scene);
};

function VueCarre(x, y, scene, className) {

	var getColor = function() {
		switch (className) {
		case "Barre":
			return 0x1a7e34;
		case "Carre":
			return 0x1a7ecc;
		case "L":
			return 0xaea811;
		case "LBar":
			return 0xae6d11;
		case "S":
			return 0xae6de9;
		case "T":
			return 0xcfc35e;
		case "Z":
			return 0x28bce1;
		default:
			throw new Error("Couleur pour la classe " + className
					+ " non definie");
			break;
		}
		;
	};

	var carre3d = new THREE.Mesh(VuePlateau3D.CUBE_GEOMETRY,
	// new THREE.MeshBasicMaterial({
	// color : Math.random() * 0xffffff
	/*
	 * , opacity : 0.5
	 */
	// })
	new THREE.MeshLambertMaterial({
		ambient : 0x808080,
		color : getColor()
	}));
	carre3d.position.x = x * Style.RATIO;
	carre3d.position.y = 0;
	carre3d.position.z = y * Style.RATIO;

	carre3d.castShadow = true;
	carre3d.receiveShadow = true;

	var transformationMatrix = Matrix.translationTo(x, y);

	Style.transformMatrix(transformationMatrix.getValeurs(), carre3d);

	var vueLignes = null;

	this.setVueLignes = function(vue) {
		vueLignes = vue;
	};

	this.deplace = function(matrice) {
		var x1 = this.getX();
		var y1 = this.getY();

		transformationMatrix = transformationMatrix.addTransformation(matrice);

		vueLignes.deplace(x1, y1, this);

		Style.transformMatrix(transformationMatrix.getValeurs(), carre3d);
	};

	this.getX = function() {
		return transformationMatrix.getTranslation().getValeurs()[0][0];
	};

	this.getY = function() {
		return transformationMatrix.getTranslation().getValeurs()[0][1];
	};

	this.efface = function() {
		scene.remove(carre3d);
	};

	this.dessine = function() {
		scene.add(carre3d);
	};
}

function Style() {

}

Style.RATIO = 40;

Style.transformMatrix = function(values, element) {
	var tx = values[0][2] * Style.RATIO;
	var ty = values[1][2] * Style.RATIO;

	element.position.x = tx - 5 * Style.RATIO;
	element.position.z = ty;
};

function VueLignes() {
	var lignes = [];

	for (var i = 0; i < 22; i++) {
		lignes.push(new VueLigne());
	}

	this.deplace = function(x1, y1, carre) {
		var x2 = carre.getX();
		var y2 = carre.getY();
		lignes[y2].set(x2, carre);
		if (lignes[y1].get(x1) == carre && (x1 != x2 || y1 != y2))
			lignes[y1].set(x1, null);
	};

	this.efface = function(index, nombre) {

		for (var i = index; i < index + nombre; i++) {
			lignes[i].efface();
		}

		var translation = Matrix.translationTo(0, -nombre);
		for (var i = index + nombre; i < 22; i++) {
			lignes[i].deplace(translation);
		}
	};

	this.ajoutePiece = function(carres) {
		for (var i = 0; i < carres.length; i++) {
			var carre = carres[i];

			lignes[carre.getY()].set(carre.getX(), carre);
			carre.setVueLignes(this);
		}
	};

	this.toString = function() {
		var result = "[\n";

		for (var i = lignes.length - 1; i >= 0; i--) {
			if (result.length > 2)
				result += ",\n";
			result += lignes[i].toString();
		}

		return result + "\n]";
	};
}

function VueLigne() {
	var carres = [];

	this.set = function(x, carre) {
		carres[x] = carre;
	};

	this.get = function(x) {
		return carres[x];
	};

	this.efface = function() {
		for (var i = 0; i < carres.length; i++) {
			carres[i].efface();
		}
		carres = [];
	};

	this.deplace = function(matrice) {
		for (var i = 0; i < carres.length; i++) {
			if (carres[i]) {
				carres[i].deplace(matrice);
			}
		}
	};

	this.toString = function() {
		var result = "[";

		for (var i = 0; i < 10; i++) {
			if (result.length > 1)
				result += ", ";
			result += (carres[i] ? "O" : "_");
		}

		return result + "]";
	};
}

function VueProchainePiece() {
	var carresDiv = [];

	/*
	 * var preview = document.createElement("div"); preview.className =
	 * "preview";
	 * 
	 * document.body.appendChild(preview);
	 */

	var piece = null;

	this.dessine = function(cubes, scene) {

		var nextPiece = VuePiece.newInstance(cubes, scene);

		/*
		 * for (var i = 0; i < carresDiv.length; i++) {
		 * preview.removeChild(carresDiv[i]); }
		 */

		carresDiv = [];

		/*
		 * for (var i = 0; i < nextPiece.getVuesCarres().length; i++) { var
		 * vueCarre = nextPiece.getVuesCarres()[i];
		 * 
		 * var x = vueCarre.getX() - 3; var y = vueCarre.getY() - 20;
		 * 
		 * var carreDiv = document.createElement("div");
		 * carresDiv.push(carreDiv); carreDiv.className = "carre " +
		 * nextPiece.getClassName();
		 * 
		 * var transformationMatrix = Matrix.translationTo(x, y);
		 * 
		 * Style.transformMatrix(transformationMatrix.getValeurs(), carreDiv);
		 * preview.appendChild(carreDiv); }
		 */

		var result = piece;
		piece = nextPiece;

		return result;

	};
}

function VueScore() {
	var score = document.createElement("div");
	score.className = "score";
	document.body.appendChild(score);

	var labelNiveau = document.createElement("div");
	score.appendChild(labelNiveau);
	labelNiveau.innerHTML = "Niveau";

	var niveau = document.createElement("div");
	score.appendChild(niveau);

	var labelNbLignes = document.createElement("div");
	score.appendChild(labelNbLignes);
	labelNbLignes.innerHTML = "Nombre de lignes";

	var nbLignes = document.createElement("div");
	score.appendChild(nbLignes);

	var labelScore = document.createElement("div");
	score.appendChild(labelScore);
	labelScore.innerHTML = "Points";

	var points = document.createElement("div");
	score.appendChild(points);

	this.update = function(iNbLignes, iNiveau, iPoints) {
		nbLignes.innerHTML = iNbLignes;
		niveau.innerHTML = iNiveau;
		points.innerHTML = iPoints;
	};

	this.update(0, 1, 0);
}
