var Matrix = null;

define([ "../tools/Event", "../tools/Matrix", "vue/DynamicStyles" ],
		function(Event, matrix, DynamicStyles) {
			Matrix = matrix;

			return {
				newInstance : function(presenter, ScreenScale) {
					return new VuePlateau(presenter, DynamicStyles,
							ScreenScale, Event);
				}
			};
		});

function VueBouttonMenu(presenter, playList, Event) {
	var enPause = false;

	var pause = function() {
		enPause = !enPause;
		if (enPause) {
			playList.pause();
		} else {
			playList.play();
		}
	};

	this.click = function(event) {
		if (!enPause) {
			presenter.pause();
			presenter.openPauseScreen(function() {
				presenter.pause();
				pause();
			});
			pause();
		}
	};

	var bouttonmenu = document.createElement("div");
	bouttonmenu.className = "bouttonmenu";
	document.body.appendChild(bouttonmenu);

	var bouton = document.createElement("div");
	bouttonmenu.appendChild(bouton);
	bouton.className = "button";
	bouton.innerHTML = "Menu";

	Event.addClickEventListener(bouton, this.click);

	this.resize = function(dimensions) {
		bouttonmenu.style.marginLeft = dimensions.bouttonMenu.marginLeft + "px";
		bouttonmenu.style.marginTop = dimensions.bouttonMenu.marginTop + "px";
		bouttonmenu.style.width = dimensions.bouttonMenu.width + "px";
		bouttonmenu.style.height = dimensions.bouttonMenu.height + "px";
	};
}

function PlayList(node) {
	var that = this;
	var on = true;
	var cordovaPlatform = !(typeof Media == "undefined");

	console.log("is cordova platform = " + cordovaPlatform);

	var noms = [ "tetris.mp3", "Mini_marche_turque.mp3",
			"fahnenmarsch_remix.mp3" ];

	var morceaux = [];

	for (var i = 0; i < noms.length; i++) {
		var morceau;

		if (cordovaPlatform) {
			var url = PlayList.getPathToWww() + "/scripts/vue/" + noms[i];
			console.log("trying to get " + url);
			morceau = new Media(url, function(mediaStatus) {
				changeMorceau();
			}, function(error) {
				console.log('code: ' + error.code + '\n' + 'message: '
						+ error.message + '\n');
			});
		} else {
			morceau = document.createElement("audio");
			node.appendChild(morceau);
			morceau.src = "scripts/vue/" + noms[i];
		}
		morceaux.push(morceau);
	}

	this.musicSwitchOff = function() {
		on = !on;
		if (!on)
			this.pause();
	};

	if (cordovaPlatform) {
		// morceaux[0].setVolume(0.5);
	} else {
		morceaux[0].volume = 0.5;
	}

	var currentMorceau = 0;

	this.play = function() {
		if (on)
			morceaux[currentMorceau].play();
	};

	this.pause = function() {
		morceaux[currentMorceau].pause();
	};

	this.stop = function() {
		that.pause();
		morceaux[currentMorceau].currentTime = 0;
		currentMorceau = 0;
	};

	var changeMorceau = function() {
		currentMorceau++;
		if (currentMorceau >= morceaux.length)
			currentMorceau = 0;

		morceaux[currentMorceau].play();
	};

	if (!cordovaPlatform) {
		for (var i = 0; i < morceaux.length; i++) {
			morceaux[i].addEventListener("ended", function(event) {
				changeMorceau();
			});
		}
	}
}

function SoundList(node, playList) {
	var noms = [ "sf_explosion_01.mp3" ];

	var cordovaPlatform = !(typeof Media == "undefined");

	var sons = [];

	for (var i = 0; i < noms.length; i++) {
		var son;
		if (cordovaPlatform) {
			son = new Media(
					PlayList.getPathToWww() + "/scripts/vue/" + noms[i],
					function(mediaStatus) {
						playList.play();
					});
		} else {
			son = document.createElement("audio");
			node.appendChild(son);
			son.src = "scripts/vue/" + noms[i];
			son.addEventListener("ended", function(event) {
				playList.play();
			});
		}
		sons.push(son);
	}

	this.playExplosion = function() {
		playList.pause();
		sons[0].play();
	};
}

PlayList.getPathToWww = function() {
	var url = window.location.pathname + "";
	return url.substring(0, url.lastIndexOf("/"));
};

function VuePlateau(presenter, DynamicStyles, ScreenScale, Event) {
	var dynamicStyles = DynamicStyles.getInstance();

	var plateau = document.createElement("div");
	plateau.className = "plateau";

	document.body.appendChild(plateau);

	var playList = new PlayList(plateau);
	var soundList = new SoundList(plateau, playList);

	var vueLignes = null;
	var vueProchainePiece = new VueProchainePiece();
	var vueScore = new VueScore();
	var vueBouttonMenu = new VueBouttonMenu(presenter, playList, Event);
	var unite;

	var plateauResize = function(event) {
		dimensions = ScreenScale.getDimensions();
		unite = dimensions.unite;

		dynamicStyles.set("body", "font-size", unite + "px");
		dynamicStyles.set(".carre", "width", unite + "px");
		dynamicStyles.set(".carre", "height", unite + "px");

		plateau.style.marginLeft = dimensions.plateau.marginLeft + "px";
		plateau.style.marginTop = dimensions.plateau.marginTop + "px";
		plateau.style.width = dimensions.plateau.width + "px";
		plateau.style.height = dimensions.plateau.height + "px";

		vueProchainePiece.resize(dimensions, dynamicStyles);
		vueScore.resize(dimensions);
		vueLignes.resize(unite);
		vueBouttonMenu.resize(dimensions);
	};

	window.addEventListener('resize', plateauResize, false);

	this.musicSwitchOff = function() {
		playList.musicSwitchOff();
	};

	this.ajoutePiece = function(cubes) {

		var piece = vueProchainePiece.dessine(cubes, this);

		if (piece != null) {
			vueLignes.ajoutePiece(piece.getVuesCarres());
			piece.dessine(plateau);
			piece.resize(unite);
		} else {
			playList.play();
		}

		return piece;
	};

	this.efface = function(index, nombre) {
		vueLignes.efface(index, nombre);
	};

	this.updateScore = function(nbLignes, points) {
		vueScore.update(nbLignes, points);
	};

	this.updateNiveau = function(iNiveau) {
		vueScore.updateNiveau(iNiveau);
	};

	this.reset = function() {
		addKeyEventListener();
		vueProchainePiece.reset();
		if (vueLignes)
			vueLignes.clear();
		vueLignes = new VueLignes(presenter, soundList);

		vueScore.update(0, 0);
		vueScore.updateNiveau(1);

		plateauResize();
	};

	this.lost = function() {
		playList.stop();
		removeKeyEventListener();
	};

	var keyListener = function(event) {
		switch (event.keyCode) {
		case 13:
			vueBouttonMenu.click(event);
			break;
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
	};

	var addKeyEventListener = function() {
		document.body.addEventListener("keydown", keyListener);
	};

	var removeKeyEventListener = function() {
		document.body.removeEventListener("keydown", keyListener);
	};

	var startx = 0;
	var starty = 0;
	var touchDiv = document.createElement("div");
	var screenWidth = parseInt(window.screen.width);

	document.body.appendChild(touchDiv);
	touchDiv.className = "touchEvents";

	touchDiv.addEventListener('touchstart',
			function(e) {
				var touchobj = e.changedTouches[0]; // reference first touch
				// point (ie:
				// first finger)
				startx = parseInt(touchobj.clientX ? touchobj.clientX
						: touchobj.pageX); // get x position of touch point
				// relative to left edge of browser
				starty = parseInt(touchobj.clientY ? touchobj.clientY
						: touchobj.pageY);
				e.preventDefault();
			}, false);

	touchDiv.addEventListener('touchmove', function(e) {
		var touchobj = e.changedTouches[0]; // reference first touch point for
		// this event
		var distX = parseInt(touchobj.clientX ? touchobj.clientX
				: touchobj.pageX)
				- startx;
		var distY = parseInt(touchobj.clientY ? touchobj.clientY
				: touchobj.pageY)
				- starty;

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

		var endx = parseInt(touchobj.clientX ? touchobj.clientX
				: touchobj.pageX);
		var endy = parseInt(touchobj.clientY ? touchobj.clientY
				: touchobj.pageY);
		var distX = endx - startx;
		var distY = endy - starty;

		if (Math.sqrt(distX * distX + distY * distY) < 2) {
			presenter.tourneHoraire(event);
		}

		e.preventDefault();
	}, false);

	this.reset();

	this.toString = function() {
		return vueLignes.toString();
	};

	this.playMusic = function() {
		playList.play();
	};

	this.stopMusic = function() {
		playList.pause();
	};
}

VuePlateau.jpgBack = '<img src="scripts/vue/yaroslavl_blue.jpg">';

function VuePiece(cubes) {
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

		vueCubes.push(new VueCarre(cube[0], cube[1], className));
	}

	this.resize = function(unite) {
		for (var i = 0; i < vueCubes.length; i++) {
			var cube = vueCubes[i];

			cube.resize(unite);
		}
	};

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

	this.dessine = function(plateau) {
		for (var i = 0; i < vueCubes.length; i++) {
			var cube = vueCubes[i];
			cube.dessine(plateau);
		}
	};
}

VuePiece.newInstance = function(cubes) {
	return new VuePiece(cubes);
};

function VueCarre(x, y, className) {

	var carreDiv = document.createElement("div");
	carreDiv.className = "carre " + className;

	var innerCarreDiv = document.createElement("div");
	carreDiv.appendChild(innerCarreDiv);

	var transformationMatrix = Matrix.translationTo(x, y);

	var vueLignes = null;

	this.setVueLignes = function(vue) {
		vueLignes = vue;
	};

	var unite;

	this.resize = function(newUnite) {
		unite = newUnite ? newUnite : unite;
		Style.transformMatrix(transformationMatrix.getValeurs(), carreDiv,
				unite);
	};

	this.deplace = function(matrice) {
		var x1 = this.getX();
		var y1 = this.getY();

		transformationMatrix = transformationMatrix.addTransformation(matrice);

		vueLignes.deplace(x1, y1, this);

		this.resize();
	};

	this.getX = function() {
		return transformationMatrix.getTranslation().getValeurs()[0][0];
	};

	this.getY = function() {
		return transformationMatrix.getTranslation().getValeurs()[0][1];
	};

	this.efface = function() {
		carreDiv.style.opacity = 0;

		window.setTimeout(function() {
			carreDiv.parentNode.removeChild(carreDiv);
		}, 500);

	};

	this.dessine = function(plateau) {
		plateau.appendChild(carreDiv);
	};
}

function Style() {

}

Style.transformMatrix = function(values, element, styleRatio) {

	var a = values[0][0];
	var b = values[0][1];
	var c = values[1][0];
	var d = values[1][1];
	var tx = values[0][2] * styleRatio;
	var ty = -values[1][2] * styleRatio + 19 * styleRatio;

	var result = "matrix(" + a + ", " + c + ", " + b + ", " + d + ", " + tx
			+ ", " + ty + ")";

	/*
	 * element.style.webkitTransform = result; element.style.MozTransform =
	 * result; element.style.msTransform = result; element.style.OTransform =
	 * result; element.style.transform = result;
	 */
	element.style.top = ty + "px";
	element.style.left = tx + "px";
};

function VueLignes(presenter, soundList) {
	var lignes = [];

	for (var i = 0; i < 22; i++) {
		lignes.push(new VueLigne());
	}

	this.resize = function(unite) {
		for (var i = 0; i < 22; i++) {
			lignes[i].resize(unite);
		}
	};

	this.deplace = function(x1, y1, carre) {
		var x2 = carre.getX();
		var y2 = carre.getY();
		lignes[y2].set(x2, carre);
		if (lignes[y1].get(x1) == carre && (x1 != x2 || y1 != y2))
			lignes[y1].set(x1, null);
	};

	this.clear = function() {
		for (var i = 0; i < lignes.length; i++) {
			lignes[i].efface();
		}
	};

	this.efface = function(index, nombre) {
		if (nombre == 4) {
			presenter.pause();
			soundList.playExplosion();

			document.body.style.backgroundColor = "black";

			window.setTimeout(function() {
				document.body.style.backgroundColor = "#A16868";

				window.setTimeout(function() {
					document.body.style.backgroundColor = "#FF691B";

					window.setTimeout(function() {
						presenter.pause();
						document.body.style.backgroundColor = null;
					}, 300);
				}, 300);
			}, 300);
		}
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
			if (carres[i])
				carres[i].efface();
		}
		carres = [];
	};

	this.resize = function(unite) {
		for (var i = 0; i < carres.length; i++) {
			if (carres[i])
				carres[i].resize(unite);
		}
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

	var preview = document.createElement("div");
	preview.className = "preview";
	document.body.appendChild(preview);

	var unite;
	var dimensions;

	this.resize = function(inDimensions, dynamicStyles) {
		unite = inDimensions ? inDimensions.unite : unite;
		dimensions = inDimensions ? inDimensions : dimensions;

		preview.style.marginLeft = dimensions.nextPiece.marginLeft + "px";
		preview.style.marginTop = dimensions.nextPiece.marginTop + "px";
		preview.style.width = dimensions.nextPiece.width + "px";
		preview.style.height = dimensions.nextPiece.height + "px";

		if (dynamicStyles) {
			dynamicStyles.set(".preview>.carre", "margin-top", (unite / 2)
					+ "px");
			dynamicStyles.set(".preview>.carre", "width", (unite / 2) + "px");
			dynamicStyles.set(".preview>.carre", "height", unite + "px");
			dynamicStyles.set(".preview>.carre", "width", unite + "px");
		}

		if (piece) {
			for (var i = 0; i < piece.getVuesCarres().length; i++) {
				var vueCarre = piece.getVuesCarres()[i];
				var carreDiv = carresDiv[i];

				var x = vueCarre.getX() - 3;
				var y = vueCarre.getY() - 2;

				var transformationMatrix = Matrix.translationTo(x, y);

				Style.transformMatrix(transformationMatrix.getValeurs(),
						carreDiv, unite);
			}
		}
	};

	var piece = null;

	this.reset = function() {
		piece = null;

		for (var i = 0; i < carresDiv.length; i++) {
			preview.removeChild(carresDiv[i]);
		}

		carresDiv = [];
	};

	this.dessine = function(cubes, plateau) {

		var nextPiece = VuePiece.newInstance(cubes);

		for (var i = 0; i < carresDiv.length; i++) {
			preview.removeChild(carresDiv[i]);
		}

		carresDiv = [];

		for (var i = 0; i < nextPiece.getVuesCarres().length; i++) {
			var carreDiv = document.createElement("div");
			carresDiv.push(carreDiv);
			carreDiv.className = "carre " + nextPiece.getClassName();
			preview.appendChild(carreDiv);

			var innerCarreDiv = document.createElement("div");
			carreDiv.appendChild(innerCarreDiv);
		}

		var result = piece;
		piece = nextPiece;

		this.resize();

		return result;

	};
}

function VueScore() {
	var score = document.createElement("div");
	score.className = "score";
	document.body.appendChild(score);

	this.resize = function(dimensions) {
		score.style.marginLeft = dimensions.score.marginLeft + "px";
		score.style.marginTop = dimensions.score.marginTop + "px";
		score.style.width = dimensions.score.width + "px";
		score.style.height = dimensions.score.height + "px";
	};

	var labelNiveau = document.createElement("div");
	score.appendChild(labelNiveau);
	labelNiveau.innerHTML = "Level";

	var niveau = document.createElement("div");
	score.appendChild(niveau);

	var labelNbLignes = document.createElement("div");
	score.appendChild(labelNbLignes);
	labelNbLignes.innerHTML = "Number of lines";

	var nbLignes = document.createElement("div");
	score.appendChild(nbLignes);

	var labelScore = document.createElement("div");
	score.appendChild(labelScore);
	labelScore.innerHTML = "Points";

	var points = document.createElement("div");
	score.appendChild(points);

	this.update = function(iNbLignes, iPoints) {
		nbLignes.innerHTML = iNbLignes;
		points.innerHTML = iPoints;
	};

	this.updateNiveau = function(iNiveau) {
		niveau.innerHTML = iNiveau;
	};
}
