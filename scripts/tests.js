var AjaxTool = null;

require([ "tools/SyncArray" ], function(SyncArray) {

	new Test0001(SyncArray);
	new Test0002(SyncArray);
	new Test0003(SyncArray);

});

function Test0001(SyncArray) {
	var myArray = SyncArray.newInstance([ {
		nom : "Valeur dans le modele"
	} ], function() {
	});

	var div = document.createElement("div");
	div.className = "test";
	document.body.appendChild(div);

	var h2 = document.createElement("h2");
	div.appendChild(h2);
	h2.innerHTML = "Test 0001";

	var description = document.createElement("p");
	div.appendChild(description);
	description.innerHTML = "Test de l'array avec mise à jour à un sens";

	var input = document.createElement("input");
	input.type = "text";
	input.value = myArray[0].nom;
	div.appendChild(input);

	input.addEventListener("keyup", function(event) {
		myArray[0].nom = this.value;
	}, false);

	var result = document.createElement("span");
	div.appendChild(result);

	myArray.addEventListener("update", function(e) {
		result.innerHTML = e.target[0].nom;
	}, false);
}

function Test0002(SyncArray) {
	var myArray = SyncArray.newInstance([], function() {
	});

	var div = document.createElement("div");
	div.className = "test";
	document.body.appendChild(div);

	var h2 = document.createElement("h2");
	div.appendChild(h2);
	h2.innerHTML = "Test 0002";

	var description = document.createElement("p");
	div.appendChild(description);
	description.innerHTML = "Test de l'array avec 'push' dans liste";

	var input = document.createElement("input");
	input.type = "text";
	div.appendChild(input);

	var addButton = document.createElement("a");
	div.appendChild(addButton);
	addButton.href = "#";
	addButton.innerHTML = "ajouter";
	addButton.addEventListener("click", function(event) {
		event.stopPropagation();
		if (input.value.length > 0) {

			var id = Math.floor(Math.random() * 100000);
			myArray.push({
				id : id,
				value : input.value
			});

			input.value = "";
		}

		return false;
	}, false);

	var table = document.createElement("table");
	div.appendChild(table);

	var drawTable = function() {
		table.innerHTML = "";

		if (myArray.length > 0) {
			var header = document.createElement("tr");
			table.appendChild(header);

			for ( var prop in myArray[0]) {
				var th = document.createElement("th");
				th.innerHTML = prop;
				header.appendChild(th);
			}

			for (var i = 0; i < myArray.length; i++) {
				var tr = document.createElement("tr");
				table.appendChild(tr);

				var td = document.createElement("td");
				tr.appendChild(td);
				td.innerHTML = myArray[i].id;

				td = document.createElement("td");
				tr.appendChild(td);

				var input = document.createElement("input");
				input.type = "text";
				input.value = myArray[i].value;
				input.modele = myArray[i];

				input.addEventListener("keyup", function(event) {
					this.modele.value = this.value;
				});

				td.appendChild(input);

				td = document.createElement("td");
				tr.appendChild(td);
				
				var delButton = document.createElement("a");
				td.appendChild(delButton);
				delButton.href = "#";
				delButton.innerHTML = "delete";
				delButton.modele = myArray[i];
				delButton.addEventListener("click", function(event) {
					event.stopPropagation();

					var index = myArray.indexOf(this.modele);
					myArray.splice(index, 1);

					return false;
				}, false);
			}
		} else {
			return;
		}

	};

	myArray.addEventListener("insert", function(e) {
		drawTable();
	}, false);
	
	myArray.addEventListener("delete", function(e) {
		drawTable();
	}, false);

	var message = document.createElement("div");
	div.appendChild(message);

	myArray.addEventListener("update", function(e) {
		message.innerHTML = "Updating obj " + e.target[0].id + ", value "
				+ e.target[0].value;
	}, false);
}

function Test0003(SyncArray) {
	var myArray = [];
	
	SyncArray.addSyncProperties(myArray);

	var div = document.createElement("div");
	div.className = "test";
	document.body.appendChild(div);

	var h2 = document.createElement("h2");
	div.appendChild(h2);
	h2.innerHTML = "Test 0003";

	var description = document.createElement("p");
	div.appendChild(description);
	description.innerHTML = "Test binding l'array";

	var input = document.createElement("input");
	input.type = "text";
	div.appendChild(input);

	var addButton = document.createElement("a");
	div.appendChild(addButton);
	addButton.href = "#";
	addButton.innerHTML = "ajouter";
	addButton.addEventListener("click", function(event) {
		event.stopPropagation();
		if (input.value.length > 0) {

			var id = Math.floor(Math.random() * 100000);
			myArray.push({
				id : id,
				value : input.value
			});

			input.value = "";
		}

		return false;
	}, false);

	var table = document.createElement("table");
	div.appendChild(table);

	var drawTable = function() {
		table.innerHTML = "";

		if (myArray.length > 0) {
			var header = document.createElement("tr");
			table.appendChild(header);

			for ( var prop in myArray[0]) {
				var th = document.createElement("th");
				th.innerHTML = prop;
				header.appendChild(th);
			}

			for (var i = 0; i < myArray.length; i++) {
				var tr = document.createElement("tr");
				table.appendChild(tr);

				var td = document.createElement("td");
				tr.appendChild(td);
				td.innerHTML = myArray[i].id;

				td = document.createElement("td");
				tr.appendChild(td);

				var input = document.createElement("input");
				input.type = "text";
				input.value = myArray[i].value;
				input.modele = myArray[i];

				input.addEventListener("keyup", function(event) {
					this.modele.value = this.value;
				});

				td.appendChild(input);

				td = document.createElement("td");
				tr.appendChild(td);
				
				var delButton = document.createElement("a");
				td.appendChild(delButton);
				delButton.href = "#";
				delButton.innerHTML = "delete";
				delButton.modele = myArray[i];
				delButton.addEventListener("click", function(event) {
					event.stopPropagation();

					var index = myArray.indexOf(this.modele);
					myArray.splice(index, 1);

					return false;
				}, false);
			}
		} else {
			return;
		}

	};

	myArray.addEventListener("insert", function(e) {
		drawTable();
	}, false);
	
	myArray.addEventListener("delete", function(e) {
		drawTable();
	}, false);

	var message = document.createElement("div");
	div.appendChild(message);

	myArray.addEventListener("update", function(e) {
		message.innerHTML = "Updating obj " + e.target[0].id + ", value "
				+ e.target[0].value;
	}, false);
}
