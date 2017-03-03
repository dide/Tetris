
require([ 'model/Plateau', 'vue/VuePlateau3d' ], function(Plateau, VuePlateau) {
	var presenter = new Presenter();

	presenter.init(Plateau, VuePlateau);
});

function Presenter() {
	this.interfaces = [ "ModelPresenterInterface", "ViewPresenterInterface" ];

	var plateau = null;

	var vuePlateau = null;
	var vuePiece = null;

	var schedulerNatif = {
		planifieDans : function(duree, action) {
			window.setTimeout(action.execute, duree);
		}
	};

	this.gauche = function(event) {
		transformation = plateau.addAction(Direction.GAUCHE);
	};

	this.droite = function(event) {
		transformation = plateau.addAction(Direction.DROITE);
	};

	this.bas = function(event) {
		transformation = plateau.addAction(Direction.BAS);
	};

	this.tourneHoraire = function(event) {
		transformation = plateau.addAction(Direction.HORAIRE);
	};

	this.tourneAntiHoraire = function(event) {
		transformation = plateau.addAction(Direction.ANTIHORAIRE);
	};

	this.start = function(event) {
		plateau.start();
	};

	this.pause = function(event) {
		plateau.pause();
	};

	this.prochainePiece = function(event) {
		plateau.prochainePiece();
	};

	this.pieceUpdate = function(initialPosition) {
		vuePiece = vuePlateau.ajoutePiece(initialPosition);
	};

	this.lost = function(actions, salt) {
		vuePlateau.lost(salt + "_" + actions.join(""));
	};
	this.updateScore = function(nbLignes, points) {
		vuePlateau.updateScore(nbLignes, 0 /* TODO */, points);
	};
	
	this.updateNiveau = function(iNiveau){
		// TODO
	};
	
	this.deplace = function(matrice) {
		vuePiece.deplace(matrice);
	};
	this.ligneUpdate = function(indexLigne, nbLignes) {
		console.log("index ligne : " + indexLigne + ", nbLignes : " + nbLignes);
		vuePlateau.efface(indexLigne, nbLignes);
	};
	this.getNativeScheduler = function() {
		return schedulerNatif;
	};
	this.getSalt = function() {
		return Math.floor((Math.random() + 1) * 999999999);
	};

	this.init = function(Plateau, VuePlateau) {
		plateau = Plateau.newInstance(this);
		vuePlateau = VuePlateau.newInstance(this);
		// vuePlateau.ajoutePiece(plateau.getPieceEnAttente());
	};
}
