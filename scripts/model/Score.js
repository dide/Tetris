var InterfaceHelper = null;
var ModelPresenterScoreInterface = null;

define([], function() {
	return {
		newInstance : function(presenter) {
			return new Score(presenter);
		}
	};
});

function Score() {
	
	this.points = 0;
	this.data = null;
	this.name = null;

	this.ajoute = function(nouveauxPoints) {
		this.points += nouveauxPoints;
		return nouveauxPoints;
	};
}