
require([ 'model/Plateau', 'model/Score', 'model/BestScores', 'model/Config',
		'vue/VuePlateau', 'vue/VueAccueil', 'vue/VueOptions', 'vue/VueDialog',
		'vue/VueCredits', "tools/StorageFactory" ], function(
		Plateau, Score, BestScores, Config, VuePlateau, VueAccueil, VueOptions,
		VueDialog, VueCredits, StorageFactory) {

	var presenter = new Presenter();

	presenter.init(Plateau, Score, BestScores, Config, VuePlateau, VueAccueil,
			VueOptions, VueDialog, VueCredits, StorageFactory);
});

function SchedulerNatif() {
	var enPause = false;
	var waitingActions = [];

	this.isEnPause = function() {
		return enPause;
	};

	var execute = function(action) {
		return function() {
			if (!enPause)
				action.execute();
			else {
				var actualTime = new Date().getTime();
				waitingActions.push({
					execute : action.execute,
					duree : actualTime - enPause
				});
			}
		};
	};

	this.planifieDans = function(duree, action) {
		if (!enPause)
			window.setTimeout(execute(action), duree);
		else {
			waitingActions.push({
				execute : action.execute,
				duree : duree
			});
		}
	};

	this.pause = function() {
		if (enPause) {
			enPause = false;
			while (waitingActions.length > 0) {
				var action = waitingActions.pop();
				window.setTimeout(execute(action), action.duree);
			}
		} else
			enPause = new Date().getTime();
	};
}

var ScreenScale = {

	MARGIN : 0.2,
	PLATEAU : {
		WIDTH : 10,
		HEIGHT : 20
	},
	NEXT_PIECE : {
		WIDTH : 5,
		HEIGHT : 3
	},
	SCORE : {
		WIDTH : 5,
		HEIGHT : null
	},
	BOUTTON_MENU : {
		WIDTH : 5,
		HEIGHT : 6
	},
	DIALOG : {},

	getUnite : function() {
		var maxWidth = document.body.offsetWidth;
		var maxHeight = document.body.offsetHeight;
		return Math.floor(Math.min(maxWidth / 16, maxHeight / 20));
	},
	getDimensions : function() {
		var unite = ScreenScale.getUnite();

		return {
			unite : unite,
			plateau : {
				height : ScreenScale.PLATEAU.HEIGHT * unite,
				width : ScreenScale.PLATEAU.WIDTH * unite,
				marginTop : ScreenScale.PLATEAU.MARGIN_TOP * unite,
				marginLeft : ScreenScale.PLATEAU.MARGIN_LEFT * unite
			},
			nextPiece : {
				height : ScreenScale.NEXT_PIECE.HEIGHT * unite,
				width : ScreenScale.NEXT_PIECE.WIDTH * unite,
				marginTop : ScreenScale.NEXT_PIECE.MARGIN_TOP * unite,
				marginLeft : ScreenScale.NEXT_PIECE.MARGIN_LEFT * unite
			},
			score : {
				height : ScreenScale.SCORE.HEIGHT * unite,
				width : ScreenScale.SCORE.WIDTH * unite,
				marginTop : ScreenScale.SCORE.MARGIN_TOP * unite,
				marginLeft : ScreenScale.SCORE.MARGIN_LEFT * unite
			},
			bouttonMenu : {
				height : ScreenScale.BOUTTON_MENU.HEIGHT * unite,
				width : ScreenScale.BOUTTON_MENU.WIDTH * unite,
				marginTop : ScreenScale.BOUTTON_MENU.MARGIN_TOP * unite,
				marginLeft : ScreenScale.BOUTTON_MENU.MARGIN_LEFT * unite
			},
			dialog : {
				width : ScreenScale.DIALOG.WIDTH * unite,
				marginLeft : ScreenScale.DIALOG.MARGIN_LEFT * unite
			}
		};
	}
};

ScreenScale.PLATEAU.MARGIN_TOP = -ScreenScale.PLATEAU.HEIGHT / 2;
ScreenScale.PLATEAU.MARGIN_LEFT = -(ScreenScale.PLATEAU.WIDTH
		+ ScreenScale.MARGIN + ScreenScale.NEXT_PIECE.WIDTH) / 2;

ScreenScale.NEXT_PIECE.MARGIN_TOP = -ScreenScale.PLATEAU.HEIGHT / 2;
ScreenScale.NEXT_PIECE.MARGIN_LEFT = ScreenScale.PLATEAU.MARGIN_LEFT
		+ ScreenScale.PLATEAU.WIDTH + ScreenScale.MARGIN;

ScreenScale.BOUTTON_MENU.MARGIN_TOP = ScreenScale.PLATEAU.HEIGHT / 2
		- ScreenScale.BOUTTON_MENU.HEIGHT;
ScreenScale.BOUTTON_MENU.MARGIN_LEFT = ScreenScale.NEXT_PIECE.MARGIN_LEFT;

ScreenScale.SCORE.MARGIN_TOP = -ScreenScale.PLATEAU.HEIGHT / 2
		+ ScreenScale.NEXT_PIECE.HEIGHT + ScreenScale.MARGIN;
ScreenScale.SCORE.MARGIN_LEFT = ScreenScale.NEXT_PIECE.MARGIN_LEFT;
ScreenScale.SCORE.HEIGHT = ScreenScale.BOUTTON_MENU.MARGIN_TOP
		- ScreenScale.SCORE.MARGIN_TOP - ScreenScale.MARGIN;

ScreenScale.DIALOG.WIDTH = ScreenScale.PLATEAU.WIDTH + ScreenScale.MARGIN
		+ ScreenScale.SCORE.WIDTH - 2;
ScreenScale.DIALOG.MARGIN_LEFT = -(2 + ScreenScale.DIALOG.WIDTH) / 2;

function Presenter() {
	var vueAccueil = null;
	var plateau = null;

	var vuePlateau = null;
	var vuePiece = null;
	var vueOptions = null;

	var schedulerNatif = new SchedulerNatif();
	var localStorage = null;
	var config = null;
	var bestScores, score, Score;

	this.gauche = function(event) {
		if (!schedulerNatif.isEnPause())
			transformation = plateau.addAction(Direction.GAUCHE);
	};

	this.droite = function(event) {
		if (!schedulerNatif.isEnPause())
			transformation = plateau.addAction(Direction.DROITE);
	};

	this.bas = function(event) {
		if (!schedulerNatif.isEnPause())
			transformation = plateau.addAction(Direction.BAS);
	};

	this.tourneHoraire = function(event) {
		if (!schedulerNatif.isEnPause()) {
			transformation = plateau.addAction(Direction.HORAIRE);
		}
	};

	this.tourneAntiHoraire = function(event) {
		if (!schedulerNatif.isEnPause()) {
			transformation = plateau.addAction(Direction.ANTIHORAIRE);
		}
	};

	this.start = function(event) {
		plateau.start();
	};

	this.pause = function(event) {
		schedulerNatif.pause();
	};

	this.prochainePiece = function(event) {
		if (!schedulerNatif.isEnPause())
			plateau.prochainePiece();
	};

	this.pieceUpdate = function(initialPosition) {
		vuePiece = vuePlateau.ajoutePiece(initialPosition);
	};

	this.lost = function(actions, salt) {
		vuePlateau.lost();
		vueAccueil.lost();

		var data = salt + "_" + actions.join("");
		score.data = data;

		if (bestScores.canAdd(score)) {
			vueDialog.prompt(
					"Well done! you are in High Score. What is your name?",
					function(name) {
						if (!name || name.replace(" ", "").length == 0) {
							score.name = "Unknow player";
						} else {
							score.name = name;
						}
						bestScores.add(score);
						score = Score.newInstance();
						vueAccueil
								.afficheHighScore(bestScores.getDisplayData());
					});
		}
	};

	this.restart = function() {
		console.log("Restarting !");
		vuePiece = null;
		vuePlateau.reset();
		plateau.reset();
		plateau.start();
	};

	this.updateScore = function(nbLignes, nouveauxPoints) {
		score.ajoute(nouveauxPoints);
		vuePlateau.updateScore(nbLignes, score.points);
	};

	this.updateNiveau = function(iNiveau) {
		vuePlateau.updateNiveau(iNiveau);
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
		return Math.floor((Math.random() + 1) * 499999999 + 499999999);
	};

	this.init = function(Plateau, ScoreClass, BestScores, Config, VuePlateau,
			VueAccueil, VueOptions, VueDialog, VueCredits, StorageFactory) {

		vuePlateau = VuePlateau.newInstance(this, ScreenScale);
		vueAccueil = VueAccueil.newInstance(this, ScreenScale);
		vueOptions = VueOptions.newInstance(this, ScreenScale);
		vueDialog = VueDialog.newInstance(ScreenScale);
		vueCredits = VueCredits.newInstance(ScreenScale);

		plateau = Plateau.newInstance(this);
		Score = ScoreClass;
		score = Score.newInstance();

		config = Config.get(StorageFactory.getInstance().newLocalStorage(
				"config"));
		if (!config.isMusicOn()) {
			vuePlateau.musicSwitchOff();
		}

		localStorage = StorageFactory.getInstance().newLocalStorage("tetr");
		localStorage.title = "Best Score";

		bestScores = BestScores.get([ localStorage ], 10);
		vueAccueil.afficheHighScore(bestScores.getDisplayData());

		var loadingScreen = document.querySelector("body>div");
		loadingScreen.style.opacity = "0";
		window.setTimeout(function() {
			document.body.removeChild(loadingScreen);
		}, 1000);
	};

	this.confirm = function(message, handler) {
		vueDialog.confirm(message, handler);
	};

	this.emptyHighScore = function() {
		localStorage.splice(0, localStorage.length);
		vueAccueil.emptyHighScore();
	};

	this.openPauseScreen = function(closeHandler) {
		vueAccueil.resume(closeHandler);
	};

	this.openOptionsScreen = function(closeHandler) {
		vueOptions.open(closeHandler);
		vueOptions.musicSetValue(config.isMusicOn());
	};

	this.musicSwitchOff = function() {
		config.musicSwitchOff();
		vuePlateau.musicSwitchOff();
	};

	this.viewCredits = function() {
		vuePlateau.playMusic();
		vueCredits.open(function() {
			vuePlateau.stopMusic();
		});
	};
}
