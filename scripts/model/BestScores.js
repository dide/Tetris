define([], function() {
	return {
		get : function(storages, nbItems) {
			return new BestScores(storages, nbItems);
		}
	};
});

function BestScores(datas, nbItems) {

	this.canAdd = function(score) {
		for (var i = 0; i < datas.length; i++) {
			var data = datas[i];

			var index = -1;

			for (var j = 0; j < data.length; j++) {
				if (score.points > data[j].points) {
					return true;
				}
			}

			if (index == -1 && data.length < nbItems) {
				return true;
			}

			return false;
		}
	};

	this.add = function(score) {
		for (var i = 0; i < datas.length; i++) {
			var data = datas[i];

			var index = -1;

			for (var j = 0; j < data.length; j++) {
				if (score.points > data[j].points) {
					index = j;
					break;
				}
			}

			if (index == -1 && data.length < nbItems) {
				data.push(score);
				index = data.length - 1;
			} else if (index >= 0) {
				data.splice(index, 0, score);
				data.splice(nbItems - 1, data.length - nbItems);
			}

			return index >= 0;
		}
	};

	this.getDisplayData = function() {
		var result = [];

		for (var i = 0; i < datas.length; i++) {
			result.push([]);
			var data = datas[i];
			result[i].title = data.title;

			for (var j = 0; j < data.length; j++) {
				result[i].push({
					Rank : j + 1,
					Name : data[j].name,
					Points : data[j].points
				});
			}
		}

		return result;
	};
}
