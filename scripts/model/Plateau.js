var InterfaceHelper = null;
var ModelPresenterInterface = null;
var Matrix = null;

define([ "../tools/Matrix" ],
		function(matrix) {
			Matrix = matrix;

			return {
				newInstance : function(presenter) {
					return new Plateau(presenter);
				}
			};
		});

function Plateau(presenter) {
	var that = this;

	var lignes;
	var actions;

	var pieceFactory, pieceEnAttente, piece;
	var indexLigne, nbLignes, isAccelerated;

	var fillLignes = function(index, plateau) {
		for (var y = index; y < Plateau.HAUTEUR; y++) {
			lignes.push(new Ligne(plateau));
		}
	};

	var scheduler;
	var gestionnaireNiveau;

	var modelAction = {
		execute : function() {

			if (!that.addAction(Direction.BAS, true)) {
				gestionnaireNiveau.ajoute(nbLignes, isAccelerated);

				if (nbLignes > 0) {
					presenter.ligneUpdate(indexLigne, nbLignes);
					indexLigne = Number.MAX_VALUE;
					nbLignes = 0;
				}

				actions.push(Direction.BAS.code());
				piece = pieceEnAttente;
				pieceEnAttente = pieceFactory.pieceAuHasard();

				if (!piece.addToPlateau(that)) {
					scheduler.stop();
					presenter.lost(actions, pieceFactory.getSalt());
					piece = null;
					pieceEnAttente = null;
				} else {
					presenter.pieceUpdate(pieceEnAttente.initialPosition());
				}
			}

			var lastAction = actions.pop();
			if (lastAction != "T" && lastAction != Direction.BAS.code()) {
				throw new Error("Probleme ici !!!");
			}
			actions.push("T");

			isAccelerated = false;
		}
	};

	this.reset = function() {
		lignes = [];
		actions = [];

		pieceFactory = new PieceFactory(presenter.getSalt());

		pieceEnAttente = pieceFactory.pieceAuHasard();
		piece = null;

		fillLignes(0, this);

		indexLigne = Number.MAX_VALUE;
		nbLignes = 0;
		isAccelerated = false;

		scheduler = new Scheduler(gestionnaireNiveau);
		gestionnaireNiveau = new GestionnaireNiveau(function(nouveauNiveau) {
			scheduler.setNiveau(nouveauNiveau);
			presenter.updateNiveau(nouveauNiveau);
		}, presenter);

		scheduler.initialise(presenter.getNativeScheduler(), modelAction);
	};

	this.reset();

	this.getContainer = function(x, y) {
		if (y >= lignes.length || y < 0 || x < 0)
			return null;
		return lignes[y].getContainer(x);
	};

	this.getIndexOf = function(ligne) {
		return lignes.indexOf(ligne);
	};

	this.peutSeDeplacer = function(coordonnees, y) {

		var x = null;

		if (!y && y !== 0) {
			x = coordonnees.getValeurs()[0][0];
			y = coordonnees.getValeurs()[0][1];
		} else {
			x = coordonnees;
		}
		var container = this.getContainer(x, y);
		return container !== null && container.estLibre();
	};

	this.addAction = function(direction) {
		var transformation = null;

		switch (direction) {
		case Direction.HAUT:
		case Direction.BAS:
		case Direction.GAUCHE:
		case Direction.DROITE:
			if (piece)
				transformation = piece.translate(direction);
			break;

		default:
			if (piece)
				transformation = piece.tourne(direction);

			break;
		}

		if (transformation) {
			if (direction == Direction.BAS) {
				isAccelerated = true;
			}

			actions.push(direction.code());
			presenter.deplace(transformation);
			return true;
		} else {
			return false;
		}
	};

	this.prochainePiece = function() {

		if (!piece)
			return;

		var nbDescente = 0;
		for (var i = 0; i < Plateau.HAUTEUR - 2; i++) {
			var translation = piece.translate(Direction.BAS);
			if (translation) {
				nbDescente++;
				actions.push(Direction.BAS.code());
			}
		}

		if (nbDescente > 0) {
			isAccelerated = true;
			presenter.deplace(Matrix.translationTo(0, -nbDescente));
		}
	};

	this.ligneComplete = function(ligne) {
		if (ligne.getIndex() <= indexLigne) {
			indexLigne = ligne.getIndex();
		}
		nbLignes++;

		lignes.splice(ligne.getIndex(), 1);

		fillLignes(Plateau.HAUTEUR - 1, this);
	};

	this.start = function() {

		presenter.pieceUpdate(pieceEnAttente.initialPosition());
		piece = pieceEnAttente;
		pieceEnAttente = pieceFactory.pieceAuHasard();
		piece.addToPlateau(this);

		presenter.pieceUpdate(pieceEnAttente.initialPosition());

		scheduler.start();
	};

	this.getPieceEnAttente = function() {
		return pieceEnAttente.initialPosition();
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
};

Plateau.HAUTEUR = 22;

function Ligne(plateau) {
	var nbCubes = 0;

	var containers = [];

	for (var i = 0; i < Ligne.LARGEUR; i++) {
		containers[i] = new ContainerDeCube(this);
	}

	this.getIndex = function() {
		return plateau.getIndexOf(this);
	};

	var estComplete = function() {
		return nbCubes >= Ligne.LARGEUR;
	};

	this.metAJourCompteur = function() {

		nbCubes = 0;
		for (var i = 0; i < containers.length; i++) {
			if (!containers[i].estLibre())
				nbCubes++;
		}

		if (estComplete()) {
			plateau.ligneComplete(this);
		}

	};

	this.getContainer = function(x) {
		if (x < 0 || x >= containers.length)
			return null;
		return containers[x];
	};

	this.getIndexOf = function(container) {
		return containers.indexOf(container);
	};

	this.toString = function() {
		var result = "[";

		for (var i = 0; i < Ligne.LARGEUR; i++) {
			if (result.length > 1)
				result += ", ";
			result += (!containers[i].estLibre() ? "O" : "_");
		}

		return result + "]";
	};
}

Ligne.LARGEUR = 10;

function ContainerDeCube(ligne) {
	this.cube = null;
	this.ligneUpdated = false;

	this.estLibre = function() {
		return this.cube === null;
	};

	this.clear = function(cube) {
		if (cube === this.cube)
			this.cube = null;
	};

	this.setCube = function(cube) {
		this.cube = cube;
	};

	this.metAJourLigne = function() {
		if (!this.ligneUpdated && !this.estLibre()) {
			ligne.metAJourCompteur();
			this.ligneUpdated = true;
		}
	};

	this.getLigne = function() {
		return ligne;
	};

	this.getX = function() {
		return ligne.getIndexOf(this);
	};

	this.getY = function() {
		return ligne.getIndex();
	};
};

function Direction() {

	this.next = function(sens) {
		switch (sens) {
		case Direction.ANTIHORAIRE:
			switch (this) {
			case Direction.HAUT:
				return Direction.GAUCHE;
			case Direction.GAUCHE:
				return Direction.BAS;
			case Direction.BAS:
				return Direction.DROITE;
			case Direction.DROITE:
				return Direction.HAUT;
			}

		case Direction.HORAIRE:
			switch (this) {
			case Direction.HAUT:
				return Direction.DROITE;
			case Direction.DROITE:
				return Direction.BAS;
			case Direction.BAS:
				return Direction.GAUCHE;
			case Direction.GAUCHE:
				return Direction.HAUT;
			}
		}
	};

	this.toString = function() {
		switch (this) {
		case Direction.HAUT:
			return "HAUT";
		case Direction.BAS:
			return "BAS";
		case Direction.GAUCHE:
			return "GAUCHE";
		case Direction.DROITE:
			return "DROITE";
		case Direction.HORAIRE:
			return "HORAIRE";
		case Direction.ANTIHORAIRE:
			return "ANTIHORAIRE";
		}
	};

	this.code = function() {
		switch (this) {
		case Direction.HAUT:
			return "H";
		case Direction.BAS:
			return "B";
		case Direction.GAUCHE:
			return "G";
		case Direction.DROITE:
			return "D";
		case Direction.HORAIRE:
			return "R";
		case Direction.ANTIHORAIRE:
			return "A";
		}
	};
}

Direction.HAUT = new Direction();
Direction.BAS = new Direction();
Direction.GAUCHE = new Direction();
Direction.DROITE = new Direction();
Direction.HORAIRE = new Direction();
Direction.ANTIHORAIRE = new Direction();

Direction.getInstanceFromString = function(value) {
	switch (value) {

	case Direction.HAUT.code():
		return Direction.HAUT;
	case Direction.BAS.code():
		return Direction.BAS;
	case Direction.GAUCHE.code():
		return Direction.GAUCHE;
	case Direction.DROITE.code():
		return Direction.DROITE;
	case Direction.HORAIRE.code():
		return Direction.HORAIRE;
	case Direction.ANTIHORAIRE.code():
		return Direction.ANTIHORAIRE;
	default:
		throw new Error("Code non trouve : " + value);
	}
};

function PetitCube(container) {
	this.deplaceVers = function(nouveauContainer) {
		container.clear(this);
		nouveauContainer.setCube(this);
		container = nouveauContainer;
	};

	this.clear = function() {
		container.clear(this);
	};

	this.reset = function() {
		container.setCube(this);
	};

	this.metAJourLigne = function() {
		container.metAJourLigne();
	};

	this.getX = function() {
		return container.getX();
	};

	this.getY = function() {
		return container.getY();
	};

	this.transforme = function(matrice) {
		var mesCoordonnees = new Coordonnees(this.getX(), this.getY());

		return mesCoordonnees.multiplie(matrice.getRotation()).ajoute(
				matrice.getTranslation());
	};

	this.metAJourLigne = function() {
		container.metAJourLigne();
	};
}

function Piece(orientation) {
	this.cubes = [];

	this.orientation = orientation;
	this.plateau = null;

	this.x = null;
	this.y = null;

	this.addToPlateau = function(plateau) {
		var initialPosition = this.initialPosition();
		this.plateau = plateau;

		for (var i = 0; i < initialPosition.length; i++) {
			if (!plateau.peutSeDeplacer(initialPosition[i][0],
					initialPosition[i][1]))
				return false;
		}

		for (var i = 0; i < initialPosition.length; i++) {
			var container = plateau.getContainer(initialPosition[i][0],
					initialPosition[i][1]);
			if (!container.estLibre()) {
				throw new Error("TODO : plateau complet ?!");
			}
			var petitCube = new PetitCube(container);
			this.cubes.push(petitCube);
			container.setCube(petitCube);
		}

		return true;
	};

	this.initialPosition = function() {
		throw new Error("Doit etre surcharge par une classe fille");
	};

	this.tourne = function(sens) {
		var matrice = null;

		switch (sens) {
		case Direction.ANTIHORAIRE:
			matrice = Matrix.newTransformation([ [ 0, 1, this.x + this.y ],
					[ -1, 0, -this.x + this.y ] ]);
			break;
		case Direction.HORAIRE:
			matrice = Matrix.newTransformation([ [ 0, -1, this.x - this.y ],
					[ 1, 0, this.x + this.y ] ]);
			break;
		}

		var matriceR = this.matriceR(sens);
		if (!matriceR)
			return null;
		matrice = matrice.ajoute(matriceR);

		this.orientation = this.orientation.next(sens);

		for (var i = 0; i < this.cubes.length; i++) {
			var cube = this.cubes[i];
			var nouvellesCoordonnees = cube.transforme(matrice);

			var x = nouvellesCoordonnees.getValeurs()[0][0];
			var y = nouvellesCoordonnees.getValeurs()[0][1];

			var newContainer = this.plateau.getContainer(x, y);

			cube.deplaceVers(newContainer);
		}

		return matrice;
	};

	this.matriceR = function(sens) {
		throw new Error("Doit etre surcharge par une classe fille");
	};

	this.translate = function(sens) {

		var matrice = Matrix.translation(sens);
		var mesCoordonnees = [];

		for (var i = 0; i < this.cubes.length; i++) {
			this.cubes[i].clear();
		}

		for (var i = 0; i < this.cubes.length; i++) {
			var cube = this.cubes[i];
			var nouvellesCoordonnees = cube.transforme(matrice);

			if (!this.plateau.peutSeDeplacer(nouvellesCoordonnees)) {
				for (var j = 0; j < this.cubes.length; j++) {
					this.cubes[j].reset();
					if (sens == Direction.BAS) {
						this.cubes[j].metAJourLigne();
					}
				}

				return null;
			}

			mesCoordonnees.push([ cube, nouvellesCoordonnees ]);
		}

		for (var i = 0; i < mesCoordonnees.length; i++) {
			var coordArr = mesCoordonnees[i];

			var x = coordArr[1].getValeurs()[0][0];
			var y = coordArr[1].getValeurs()[0][1];

			var newContainer = this.plateau.getContainer(x, y);
			coordArr[0].deplaceVers(newContainer);
		}

		switch (sens) {
		case Direction.HAUT:
			this.y++;
			break;
		case Direction.BAS:
			this.y--;
			break;
		case Direction.GAUCHE:
			this.x--;
			break;
		case Direction.DROITE:
			this.x++;
			break;
		}

		return matrice;
	};
}

function L() {
	Piece.call(this, Direction.GAUCHE);

	this.initialPosition = function() {
		this.x = 5;
		this.y = 21;

		return [ [ 4, 20 ], [ 5, 20 ], [ 6, 20 ], [ 6, 21 ] ];
	};

	this.matriceR = function(sens) {
		switch (this.orientation) {
		case Direction.HAUT:
			if (!this.plateau.peutSeDeplacer(this.x + 1, this.y))
				return null;
			switch (sens) {
			case Direction.HORAIRE:
				if (this.plateau.peutSeDeplacer(this.x + 2, this.y)
						&& (!this.plateau.peutSeDeplacer(this.x - 1, this.y) || !this.plateau
								.peutSeDeplacer(this.x - 1, this.y - 1))) {
					this.x++;
					return Matrix.translationSimple(1, 0);
				}

				if (!this.plateau.peutSeDeplacer(this.x - 1, this.y)
						|| !this.plateau.peutSeDeplacer(this.x - 1, this.y - 1))
					return null;

				return Matrix.EMPTY_MATRICE.clone();
			case Direction.ANTIHORAIRE:
				var result = Matrix.translationSimple(0, -1);
				if (this.plateau.peutSeDeplacer(this.x + 2, this.y)
						&& this.plateau.peutSeDeplacer(this.x + 2, this.y - 1)
						&& !this.plateau.peutSeDeplacer(this.x - 1, this.y - 1)) {
					this.x++;
					return result.ajoute(Matrix.translationSimple(1, 0));
				}

				if (!this.plateau.peutSeDeplacer(this.x - 1, this.y - 1))
					return null;

				return result;
			}
			break;
		case Direction.BAS:
			switch (sens) {
			case Direction.HORAIRE:
				if (!this.plateau.peutSeDeplacer(this.x, this.y - 1))
					return null;

				if (this.plateau.peutSeDeplacer(this.x + 2, this.y)
						&& this.plateau.peutSeDeplacer(this.x + 2, this.y - 1)
						&& !this.plateau.peutSeDeplacer(this.x - 1, this.y - 1)) {
					this.x++;
					return Matrix.translationSimple(1, 0);
				}

				if (!this.plateau.peutSeDeplacer(this.x - 1, this.y - 1))
					return null;

				return Matrix.EMPTY_MATRICE.clone();
			case Direction.ANTIHORAIRE:
				if (!this.plateau.peutSeDeplacer(this.x, this.y))
					return null;

				var result = Matrix.translationSimple(0, -1);
				if (this.plateau.peutSeDeplacer(this.x + 2, this.y)
						&& this.plateau.peutSeDeplacer(this.x, this.y - 1)
						&& (!this.plateau.peutSeDeplacer(this.x - 1, this.y) || !this.plateau
								.peutSeDeplacer(this.x - 1, this.y - 1))) {
					this.x++;
					return result.ajoute(Matrix.translationSimple(1, 0));
				}

				if (!this.plateau.peutSeDeplacer(this.x - 1, this.y)
						|| !this.plateau.peutSeDeplacer(this.x - 1, this.y - 1))
					return null;

				return result;
			}
			break;
		case Direction.GAUCHE:
			switch (sens) {
			case Direction.HORAIRE:
				if (!this.plateau.peutSeDeplacer(this.x, this.y)
						|| !this.plateau.peutSeDeplacer(this.x, this.y + 1))
					return null;

				return Matrix.translationSimple(1, 0);
			case Direction.ANTIHORAIRE:
				if (!this.plateau.peutSeDeplacer(this.x, this.y)
						|| !this.plateau.peutSeDeplacer(this.x, this.y + 1)
						|| !this.plateau.peutSeDeplacer(this.x + 1, this.y + 1))
					return null;

				return Matrix.EMPTY_MATRICE.clone();
			}
			break;
		case Direction.DROITE:
			switch (sens) {
			case Direction.HORAIRE:
				if (!this.plateau.peutSeDeplacer(this.x, this.y + 1)
						|| !this.plateau.peutSeDeplacer(this.x + 1, this.y + 1)
						|| !this.plateau.peutSeDeplacer(this.x + 1, this.y - 1))
					return null;

				return Matrix.translationSimple(1, 0);
			case Direction.ANTIHORAIRE:
				if (!this.plateau.peutSeDeplacer(this.x, this.y + 1)
						|| !this.plateau.peutSeDeplacer(this.x, this.y - 1)
						|| !this.plateau.peutSeDeplacer(this.x + 1, this.y - 1))
					return null;

				return Matrix.EMPTY_MATRICE.clone();
			}
			break;
		}
	};
}

L.prototype = Object.create(Piece.prototype);

function LBar() {
	Piece.call(this, Direction.DROITE);

	this.initialPosition = function() {
		this.x = 5;
		this.y = 21;

		return [ [ 4, 20 ], [ 5, 20 ], [ 6, 20 ], [ 4, 21 ] ];
	};

	this.matriceR = function(sens) {
		switch (this.orientation) {
		case Direction.HAUT:
			if (!this.plateau.peutSeDeplacer(this.x - 1, this.y))
				return null;
			switch (sens) {
			case Direction.ANTIHORAIRE:
				if (this.plateau.peutSeDeplacer(this.x - 2, this.y)
						&& (!this.plateau.peutSeDeplacer(this.x + 1, this.y) || !this.plateau
								.peutSeDeplacer(this.x + 1, this.y - 1))) {
					this.x--;
					return Matrix.translationSimple(-1, 0);
				}

				if (!this.plateau.peutSeDeplacer(this.x + 1, this.y)
						|| !this.plateau.peutSeDeplacer(this.x + 1, this.y - 1))
					return null;

				return Matrix.EMPTY_MATRICE.clone();
			case Direction.HORAIRE:
				var result = Matrix.translationSimple(0, -1);

				if (this.plateau.peutSeDeplacer(this.x - 2, this.y)
						&& this.plateau.peutSeDeplacer(this.x - 2, this.y - 1)
						&& !this.plateau.peutSeDeplacer(this.x + 1, this.y - 1)) {
					this.x--;
					return result.ajoute(Matrix.translationSimple(-1, 0));
				}

				if (!this.plateau.peutSeDeplacer(this.x + 1, this.y - 1)) {
					return null;
				}

				return result;
			}
			break;
		case Direction.BAS:
			switch (sens) {
			case Direction.ANTIHORAIRE:
				if (!this.plateau.peutSeDeplacer(this.x, this.y - 1))
					return null;

				if (this.plateau.peutSeDeplacer(this.x - 2, this.y)
						&& this.plateau.peutSeDeplacer(this.x - 2, this.y - 1)
						&& !this.plateau.peutSeDeplacer(this.x + 1, this.y - 1)) {
					this.x--;
					return Matrix.translationSimple(-1, 0);
				}

				if (!this.plateau.peutSeDeplacer(this.x + 1, this.y - 1))
					return null;

				return Matrix.EMPTY_MATRICE.clone();
			case Direction.HORAIRE:
				if (!this.plateau.peutSeDeplacer(this.x, this.y))
					return null;

				var result = Matrix.translationSimple(0, -1);
				if (this.plateau.peutSeDeplacer(this.x - 2, this.y)
						&& this.plateau.peutSeDeplacer(this.x, this.y - 1)
						&& (!this.plateau.peutSeDeplacer(this.x + 1, this.y) || !this.plateau
								.peutSeDeplacer(this.x + 1, this.y - 1))) {
					this.x--;
					return result.ajoute(Matrix.translationSimple(-1, 0));
				}

				if (!this.plateau.peutSeDeplacer(this.x + 1, this.y)
						|| !this.plateau.peutSeDeplacer(this.x + 1, this.y - 1))
					return null;

				return result;
			}
			break;
		case Direction.DROITE:
			switch (sens) {
			case Direction.ANTIHORAIRE:
				if (!this.plateau.peutSeDeplacer(this.x, this.y)
						|| !this.plateau.peutSeDeplacer(this.x, this.y + 1))
					return null;

				return Matrix.translationSimple(-1, 0);
			case Direction.HORAIRE:
				if (!this.plateau.peutSeDeplacer(this.x, this.y)
						|| !this.plateau.peutSeDeplacer(this.x, this.y + 1)
						|| !this.plateau.peutSeDeplacer(this.x - 1, this.y + 1))
					return null;

				return Matrix.EMPTY_MATRICE.clone();
			}
			break;
		case Direction.GAUCHE:
			switch (sens) {
			case Direction.ANTIHORAIRE:
				if (!this.plateau.peutSeDeplacer(this.x, this.y + 1)
						|| !this.plateau.peutSeDeplacer(this.x - 1, this.y + 1)
						|| !this.plateau.peutSeDeplacer(this.x - 1, this.y - 1))
					return null;

				return Matrix.translationSimple(-1, 0);
			case Direction.HORAIRE:
				if (!this.plateau.peutSeDeplacer(this.x, this.y + 1)
						|| !this.plateau.peutSeDeplacer(this.x, this.y - 1)
						|| !this.plateau.peutSeDeplacer(this.x - 1, this.y - 1))
					return null;

				return Matrix.EMPTY_MATRICE.clone();
			}
			break;
		}
	};
}

T.prototype = Object.create(Piece.prototype);

function T() {
	Piece.call(this, Direction.BAS);

	this.initialPosition = function() {
		this.x = 5;
		this.y = 21;

		return [ [ 4, 21 ], [ 5, 21 ], [ 6, 21 ], [ 5, 20 ] ];
	};

	this.matriceR = function(sens) {
		switch (this.orientation) {
		case Direction.HAUT:
			if (!this.plateau.peutSeDeplacer(this.x, this.y + 1))
				return null;

			switch (sens) {
			case Direction.ANTIHORAIRE:
				if (this.plateau.peutSeDeplacer(this.x + 1, this.y)
						&& this.plateau.peutSeDeplacer(this.x + 1, this.y + 1)
						&& !this.plateau.peutSeDeplacer(this.x - 1, this.y)) {
					this.x++;
					return Matrix.EMPTY_MATRICE.clone();
				}

				return Matrix.translationSimple(-1, 0);
			case Direction.HORAIRE:
				if (this.plateau.peutSeDeplacer(this.x - 1, this.y)
						&& this.plateau.peutSeDeplacer(this.x - 1, this.y + 1)
						&& !this.plateau.peutSeDeplacer(this.x - 1, this.y)) {
					this.x--;
					return Matrix.EMPTY_MATRICE.clone();
				}

				return Matrix.translationSimple(1, 0);
			}
			break;
		case Direction.BAS:
			if (!this.plateau.peutSeDeplacer(this.x, this.y + 1))
				return null;

			return Matrix.EMPTY_MATRICE.clone();
		case Direction.DROITE:
			switch (sens) {
			case Direction.ANTIHORAIRE:
				if (!this.plateau.peutSeDeplacer(this.x + 1, this.y - 1)) {
					return null;
				}

				var result = Matrix.translationSimple(0, -1);
				if (!this.plateau.peutSeDeplacer(this.x - 1, this.y - 1)
						&& this.plateau.peutSeDeplacer(this.x + 2, this.y - 1)) {
					this.x++;
					return result.ajoute(Matrix.translationSimple(1, 0));
				}

				return result;
			case Direction.HORAIRE:
				if (!this.plateau.peutSeDeplacer(this.x - 1, this.y)
						&& (this.plateau.peutSeDeplacer(this.x + 2, this.y) || this.plateau
								.peutSeDeplacer(this.x + 1, this.y - 1))) {
					this.x++;
					return Matrix.translationSimple(1, 0);
				}

				return Matrix.EMPTY_MATRICE.clone();
			}
			break;
		case Direction.GAUCHE:
			switch (sens) {
			case Direction.HORAIRE:
				if (!this.plateau.peutSeDeplacer(this.x - 1, this.y - 1)) {
					return null;
				}

				var result = Matrix.translationSimple(0, -1);
				if (!this.plateau.peutSeDeplacer(this.x + 1, this.y - 1)
						&& this.plateau.peutSeDeplacer(this.x - 2, this.y - 1)) {
					this.x--;
					return result.ajoute(Matrix.translationSimple(-1, 0));
				}

				return result;
			case Direction.ANTIHORAIRE:
				if (!this.plateau.peutSeDeplacer(this.x + 1, this.y)
						&& (this.plateau.peutSeDeplacer(this.x - 2, this.y) || this.plateau
								.peutSeDeplacer(this.x - 1, this.y - 1))) {
					this.x--;
					return Matrix.translationSimple(-1, 0);
				}

				return Matrix.EMPTY_MATRICE.clone();
			}
			break;
		}
	};
}

T.prototype = Object.create(Piece.prototype);

function Barre() {
	Piece.call(this, Direction.DROITE);

	this.initialPosition = function() {
		this.x = 4;
		this.y = 21;

		return [ [ 3, 20 ], [ 4, 20 ], [ 5, 20 ], [ 6, 20 ] ];
	};

	this.matriceR = function(sens) {
		switch (this.orientation) {
		case Direction.HAUT:
		case Direction.BAS:
			var result;
			switch (sens) {
			case Direction.ANTIHORAIRE:
				result = Matrix.translationSimple(1, -1);
				break;
			default:
				result = Matrix.translationSimple(0, -1);
			}

			if (!this.plateau.peutSeDeplacer(this.x - 1, this.y - 1)
					&& this.plateau.peutSeDeplacer(this.x + 1, this.y - 1)
					&& this.plateau.peutSeDeplacer(this.x + 2, this.y - 1)
					&& this.plateau.peutSeDeplacer(this.x + 3, this.y - 1)) {
				this.x++;
				return result.ajoute(Matrix.translationSimple(1, 0));
			} else if (!this.plateau.peutSeDeplacer(this.x + 2, this.y - 1)
					&& this.plateau.peutSeDeplacer(this.x + 1, this.y - 1)
					&& this.plateau.peutSeDeplacer(this.x - 1, this.y - 1)
					&& this.plateau.peutSeDeplacer(this.x - 2, this.y - 1)) {
				this.x--;
				return result.ajoute(Matrix.translationSimple(-1, 0));
			} else if (!this.plateau.peutSeDeplacer(this.x + 1, this.y - 1)
					&& this.plateau.peutSeDeplacer(this.x - 1, this.y - 1)
					&& this.plateau.peutSeDeplacer(this.x - 2, this.y - 1)
					&& this.plateau.peutSeDeplacer(this.x - 3, this.y - 1)) {
				this.x -= 2;
				return result.ajoute(Matrix.translationSimple(-2, 0));
			} else if (!this.plateau.peutSeDeplacer(this.x + 1, this.y - 1)
					&& !this.plateau.peutSeDeplacer(this.x + 2, this.y - 1)) {
				return null;
			}

			return result;

			break;

		case Direction.DROITE:
		case Direction.GAUCHE:
			if (!this.plateau.peutSeDeplacer(this.x, this.y)
					|| !this.plateau.peutSeDeplacer(this.x, this.y + 1)
					|| !this.plateau.peutSeDeplacer(this.x, this.y + 2))
				return null;

			switch (sens) {
			case Direction.ANTIHORAIRE:
				return Matrix.translationSimple(-1, 0);
			case Direction.HORAIRE:
				return Matrix.translationSimple(1, 1);
			}
			break;
		}
	};
}

Barre.prototype = Object.create(Piece.prototype);

function S() {
	Piece.call(this, Direction.DROITE);

	this.initialPosition = function() {
		this.x = 5;
		this.y = 21;

		return [ [ 4, 20 ], [ 5, 20 ], [ 5, 21 ], [ 6, 21 ] ];
	};

	this.matriceR = function(sens) {
		switch (this.orientation) {
		case Direction.HAUT:
		case Direction.BAS:

			if (!this.plateau.peutSeDeplacer(this.x, this.y - 1)) {
				return null;
			}

			var result = null;

			switch (sens) {
			case Direction.ANTIHORAIRE:
				result = Matrix.translationSimple(0, -1);
				break;
			default:
				result = Matrix.EMPTY_MATRICE.clone();
			}

			if (!this.plateau.peutSeDeplacer(this.x - 1, this.y - 1)
					&& this.plateau.peutSeDeplacer(this.x + 2, this.y)) {
				this.x++;
				return result.ajoute(Matrix.translationSimple(1, 0));
			}

			if (!this.plateau.peutSeDeplacer(this.x - 1, this.y - 1)) {
				return null;
			}

			return result;
			break;

		case Direction.DROITE:
		case Direction.GAUCHE:
			if (!this.plateau.peutSeDeplacer(this.x, this.y + 1)
					|| !this.plateau.peutSeDeplacer(this.x + 1, this.y - 1))
				return null;

			switch (sens) {
			case Direction.ANTIHORAIRE:
				return Matrix.EMPTY_MATRICE.clone();
			case Direction.HORAIRE:
				return Matrix.translationSimple(1, 0);
			}
			break;
		}
	};
}

S.prototype = Object.create(Piece.prototype);

function Z() {
	Piece.call(this, Direction.DROITE);

	this.initialPosition = function() {
		this.x = 5;
		this.y = 21;

		return [ [ 4, 21 ], [ 5, 21 ], [ 5, 20 ], [ 6, 20 ] ];
	};

	this.matriceR = function(sens) {
		switch (this.orientation) {
		case Direction.HAUT:
		case Direction.BAS:

			if (!this.plateau.peutSeDeplacer(this.x, this.y - 1)) {
				return null;
			}

			var result = null;

			switch (sens) {
			case Direction.ANTIHORAIRE:
				result = Matrix.EMPTY_MATRICE.clone();
				break;
			default:
				result = Matrix.translationSimple(0, -1);
			}

			if (!this.plateau.peutSeDeplacer(this.x + 1, this.y - 1)
					&& this.plateau.peutSeDeplacer(this.x - 2, this.y)) {
				this.x--;
				return result.ajoute(Matrix.translationSimple(-1, 0));
			}

			if (!this.plateau.peutSeDeplacer(this.x + 1, this.y - 1)) {
				return null;
			}

			return result;
			break;

		case Direction.DROITE:
		case Direction.GAUCHE:
			if (!this.plateau.peutSeDeplacer(this.x, this.y + 1)
					|| !this.plateau.peutSeDeplacer(this.x - 1, this.y - 1))
				return null;

			switch (sens) {
			case Direction.ANTIHORAIRE:
				return Matrix.translationSimple(-1, 0);
			case Direction.HORAIRE:
				return Matrix.EMPTY_MATRICE.clone();
			}
			break;
		}
	};
}

Z.prototype = Object.create(Piece.prototype);

function Carre() {
	Piece.call(this, Direction.DROITE);

	this.initialPosition = function() {
		this.x = 4;
		this.y = 21;

		return [ [ 4, 21 ], [ 5, 21 ], [ 4, 20 ], [ 5, 20 ] ];
	};

	this.matriceR = function(sens) {
		switch (sens) {
		case Direction.ANTIHORAIRE:
			return Matrix.translationSimple(0, -1);
			break;
		default:
			return Matrix.translationSimple(1, 0);
		}
	};
}

Carre.prototype = Object.create(Piece.prototype);

function PieceFactory(salt) {

	var random = new Random(salt);

	this.pieceAuHasard = function() {
		switch (Math.floor((random.getRandomValue() * 9))) {
		case 0:
			return this.pieceAuHasard();
		case 1:
			return new Barre();
		case 2:
			return new L();
		case 3:
			return new LBar();
		case 4:
			return new S();
		case 5:
			return new Z();
		case 6:
			return new T();
		case 7:
			return new Carre();
		default:
			return this.pieceAuHasard();
		}
	};

	this.getSalt = function() {
		return random.getSalt();
	};
}

function GestionnaireNiveau(changementNiveauHandler, presenter) {
	var niveau = 1;
	var nbLignesTotales = 0;

	this.ajoute = function(nbLignes, accelerated) {
		nbLignesTotales += nbLignes;

		var nouveauxPoints = nbLignes * nbLignes
				* (niveau * 120 + (accelerated ? 50 : 0));

		if (nouveauxPoints > 0) {
			presenter.updateScore(nbLignesTotales, nouveauxPoints);
		}

		var nouveauNiveau = nbLignesTotales / 10 + 1;
		nouveauNiveau = parseInt(nouveauNiveau + "");

		if (nouveauNiveau != niveau) {
			niveau = nouveauNiveau;
			changementNiveauHandler(nouveauNiveau);
		}
	};

	this.getNiveau = function() {
		return niveau;
	};

	this.getScore = function() {
		return score.getPoints();
	};

	this.getNbLignes = function() {
		return nbLignesTotales;
	};
}

function Scheduler() {

	var schedulerNatif = null;
	var repetedAction = null;

	var calculeDuree = function(nouveauNiveau) {
		return parseInt(1500 / (nouveauNiveau + 2));
	};

	var duree = null;

	var action = function() {
	};

	action.execute = function() {
		repetedAction.execute();

		if (duree) {
			schedulerNatif.planifieDans(duree, action);
		}
	};

	this.setNiveau = function(nouveauNiveau) {
		duree = calculeDuree(nouveauNiveau);
	};

	this.start = function() {
		duree = calculeDuree(1);
		schedulerNatif.planifieDans(duree, action);
	};

	this.stop = function() {
		duree = null;
	};

	this.initialise = function(iSchedulerNatif, iRepetedAction) {
		schedulerNatif = iSchedulerNatif;
		repetedAction = iRepetedAction;
	};
}

function Random(salt) {
	var n = 31;
	var currentValue = salt;

	var getBinaryDigit = function(x, n) {
		if (n < 0)
			return 0;

		return (x >> n) & 1;
	};

	var printBinaryDigits = function(x, n) {
		var result = "";
		var firstLoop = true;

		do {
			var puissance = Math.pow(2, n--);

			if (Math.floor(x / puissance) == 1) {
				result += "1";
			} else {
				if (!firstLoop)
					result += "0";
			}

			x = x % puissance;
			firstLoop = false;

		} while (n >= 0);

		return result;
	};

	var getNextRang = function(x, n) {
		return parseInt((getBinaryDigit(x, 0) ^ getBinaryDigit(x, 1))
				+ printBinaryDigits(x >> 1, n - 1), 2);
	};

	this.getRandomValue = function() {
		currentValue = getNextRang(currentValue, n);
		return currentValue / Math.pow(2, n);
	};

	this.getSalt = function() {
		return salt;
	};
}
