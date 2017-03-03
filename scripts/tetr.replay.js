var logger = null;

require([ 'model/Plateau', 'vue/VuePlateau', 'tools/Logger' ], function(
		Plateau, VuePlateau, Logger) {

	logger = Logger.getInstance();

	var label = document.createElement("h2");
	label.innerHTML = "Soumettre une partie";
	document.body.appendChild(label);

	var input = document.createElement("input");
	input.type = "file";

	document.body.appendChild(input);
	input.addEventListener("change", function(event) {
		var f = event.target.files[0];

		if (f) {
			var r = new FileReader();
			r.onload = function(e) {
				var contents = e.target.result;
				var presenter = new ReplayPresenter(contents);
				presenter.init(Plateau, VuePlateau);
				label.parentNode.removeChild(label);
				input.parentNode.removeChild(input);
			};
			r.readAsText(f);
		} else {
			alert("Failed to load file");
		}
	});
});

function ReplayPresenter(partie) {
	this.interfaces = [ "ModelPresenterInterface", "ViewPresenterInterface" ];

	var indexUnderScore = partie.indexOf("_");
	var salt = partie.substring(0, indexUnderScore);
	var actions = partie.substring(indexUnderScore + 1);
	var currentActionIndex = -1;

	var plateau = null;

	var vuePlateau = null;
	var vuePiece = null;
	var acceleration = 1.2;

	// var currentActionsIndexDiv = document.createElement("div");
	// document.body.appendChild(currentActionsIndexDiv);

	var schedulerNatif = {
		planifieDans : function(duree, action) {
			var currentActions = [];

			while (++currentActionIndex < actions.length) {
				if (actions[currentActionIndex] != "T") {
					currentActions
							.push(Direction
									.getInstanceFromString(actions[currentActionIndex]));
				} else {
					break;
				}
			}

			var newDuree = duree / (acceleration * (currentActions.length + 1));

			/*
			 * if (currentActionsIndexDiv.innerHTML.length > 0) {
			 * currentActionsIndexDiv.innerHTML += "<br>"; }
			 * currentActionsIndexDiv.innerHTML += currentActionIndex + " - " +
			 * currentActions.join(",");
			 */
			logger.info(currentActionIndex + " - " + currentActions.join(","));

			var execute = null;
			execute = function() {
				if (plateau.toString() != vuePlateau.toString()) {
					logger.info("Plateau : " + plateau.toString());
					logger.info("VuePlateau : " + vuePlateau.toString());
					throw new Error("Desynchro entre vue et modele");
				}

				if (currentActions.length == 0) {
					window.setTimeout(action.execute, newDuree);
				} else {
					var step = currentActions.splice(0, 1)[0];
					plateau.addAction(step);
					window.setTimeout(execute, newDuree);
				}
			};

			window.setTimeout(execute, newDuree);
		}
	};

	this.gauche = function(event) {
		// transformation = plateau.addAction(Direction.GAUCHE);
	};

	this.droite = function(event) {
		// transformation = plateau.addAction(Direction.DROITE);
	};

	this.bas = function(event) {
		// transformation = plateau.addAction(Direction.BAS);
	};

	this.tourneHoraire = function(event) {
		// transformation = plateau.addAction(Direction.HORAIRE);
	};

	this.tourneAntiHoraire = function(event) {
		// transformation = plateau.addAction(Direction.ANTIHORAIRE);
	};

	this.start = function(event) {
		// plateau.start();
	};

	this.pause = function(event) {
		plateau.pause();
	};

	this.prochainePiece = function(event) {
		plateau.prochainePiece();
	};

	this.pieceUpdate = function(initialPosition) {
		vuePiece = vuePlateau.ajoutePiece(initialPosition);
		logger.info("Nouvelle piece dans la previsualisation : "
				+ initialPosition);
	};

	this.lost = function(actions, salt) {
		vuePlateau.lost(salt + "_" + actions.join(""));
	};
	this.scoreUpdate = function(nbLignes, niveau, points) {
		vuePlateau.updateScore(nbLignes, niveau, points);
	};
	this.deplace = function(matrice) {
		vuePiece.deplace(matrice);
	};
	this.ligneUpdate = function(indexLigne, nbLignes) {
		logger.info(nbLignes
				+ " ligne(s) complete(s) !! A partir de l'index : "
				+ indexLigne);
		vuePlateau.efface(indexLigne, nbLignes);
	};
	this.getNativeScheduler = function() {
		return schedulerNatif;
	};
	this.getSalt = function() {
		return salt;
	};

	this.init = function(Plateau, VuePlateau) {
		plateau = Plateau.newInstance(this);
		vuePlateau = VuePlateau.newInstance(this);
		vuePlateau.ajoutePiece(plateau.getPieceEnAttente());
		plateau.start();
	};

}
