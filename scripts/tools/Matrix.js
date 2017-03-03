define(function() {
	return {
		EMPTY_MATRICE : new Transformation([ [ 0, 0, 0 ], [ 0, 0, 0 ] ]),
		translation : function(sens) {
			switch (sens) {
			case Direction.DROITE:
				return new Transformation([ [ 1, 0, 1 ], [ 0, 1, 0 ] ]);
			case Direction.GAUCHE:
				return new Transformation([ [ 1, 0, -1 ], [ 0, 1, 0 ] ]);
			case Direction.BAS:
				return new Transformation([ [ 1, 0, 0 ], [ 0, 1, -1 ] ]);
			case Direction.HAUT:
				return new Transformation([ [ 1, 0, 0 ], [ 0, 1, 1 ] ]);
			default:
				throw new Error("Cette translation n'est pas utilisee");
			}
		},
		PYSUR2 : new Transformation([ [ 0, 1, 0 ], [ -1, 0, 0 ] ]),
		MOINSPYSUR2 : new Transformation([ [ 0, -1, 0 ], [ 1, 0, 0 ] ]),

		translationTo : function(x, y) {
			return new Transformation([ [ 1, 0, x ], [ 0, 1, y ] ]);
		},

		translationSimple : function(x, y) {
			return new Transformation([ [ 0, 0, x ], [ 0, 0, y ] ]);
		},
		newTransformation : function(values) {
			return new Transformation(values);
		}
	};
});

function Matrice(values) {
	this.ajoute = function(matrice) {
		var newValeurs = matrice.getValeurs();

		if (newValeurs.length != values.length
				|| newValeurs[0].length != values[0].length)
			throw new Error("Matrice pas de la meme dimension");

		for (var i = 0; i < newValeurs.length; i++) {
			for (var j = 0; j < newValeurs[i].length; j++) {
				values[i][j] += newValeurs[i][j];
			}
		}

		return this;
	};

	this.getValeurs = function() {
		return values;
	};

	this.multiplie = function(matrice) {

		if (matrice.getValeurs().length != values[0].length)
			throw new Error(
					"Matrices pas de la bonne dimension pour une multiplication");

		var result = [];

		for (var i = 0; i < values.length; i++) {
			result[i] = [];

			for (var j = 0; j < matrice.getValeurs()[0].length; j++) {
				result[i][j] = 0;

				for (var u = 0; u < matrice.getValeurs().length; u++) {
					result[i][j] += values[i][u] * matrice.getValeurs()[u][j];
				}
			}
		}

		return new Matrice(result);
	};

	this.addTransformation = function(transformation) {
		var newRotation = this.getRotation();
		var newTranslation = this.getTranslation().multiplie(
				transformation.getRotation()).ajoute(
				transformation.getTranslation());
		return new Transformation([
				[ newRotation.getValeurs()[0][0],
						newRotation.getValeurs()[0][1],
						newTranslation.getValeurs()[0][0] ],
				[ newRotation.getValeurs()[1][0],
						newRotation.getValeurs()[1][1],
						newTranslation.getValeurs()[0][1] ] ]);
	};

	this.getRotation = function() {
		return new Transformation([ [ values[0][0], values[0][1] ],
				[ values[1][0], values[1][1] ] ]);
	};

	this.getTranslation = function() {
		return new Transformation([ [ values[0][2], values[1][2] ] ]);
	};

	this.clone = function() {
		var newValeurs = [];

		for (var i = 0; i < values.length; i++) {
			newValeurs[i] = [];

			for (var j = 0; j < values[0].length; j++) {
				newValeurs[i][j] = values[i][j];
			}
		}

		return new Matrice(newValeurs);
	};
}

function Transformation(values) {
	Matrice.call(this, values);

}

Transformation.prototype = Object.create(Matrice.prototype);

function Coordonnees(x, y) {
	Matrice.call(this, [ [ x, y ] ]);

}

Coordonnees.prototype = Object.create(Matrice.prototype);
