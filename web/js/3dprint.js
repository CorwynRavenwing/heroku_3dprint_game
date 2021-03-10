/* 3dprint_game/js/3dprint.js */

var data = {};	// move definition here to let console see 'data' object

$(document).ready(function() {
	if (typeof(Storage) === "undefined") {
		$(".main").html("Sorry! No Web Storage support. You need a more recent browser.");
		return;
	}

	var data_items_labels = {
		'version':  "Version",
		'money':    "Money",
		'filament': "Filament",
		'plastic':  "Plastic",
		'electric': "Electric",
		'kits':     "Kits",
		'printers': "Printers",
	};

	var data_items = Object.keys(data_items_labels)

	var data_items_old = [
		'version',
		'money',
		'filament',
		'plastic',
		'electric',
		'kits',
		'printers',
	];

	var setup_leftbar = function () {
		console.log('called function setup_leftbar');
		var L = $(".leftbar");

		data_items.forEach(function(item, index, array) {
			var label = data_items_labels[item]+': ';
			var innerdiv = $('<div id="data_'+item+'">0</div>');
			var outerdiv = $('<div>'+label+'</div>').addClass("data");
			outerdiv.append( innerdiv );
			L.append(outerdiv);
		});
	}

	var Blocks = 15;

	var setup_main = function () {
		console.log('called function setup_main');
		var x;
		var M = $(".main");
		for (x = 0; x < Blocks; x++) {
			var newdiv = $('<div id="block_'+x+'">(block '+x+')</div>').addClass("block");
			M.append(newdiv);
		} // next Blocks
	}

	var load_data = function () {
		console.log('called function load_data');
		data_items.forEach(function(item, index, array) {
			temp = localStorage.getItem(item);
			if (temp === null) {
				console.log("fixed", temp, "->", 0);
				temp = 0;
			}
			data[item] = temp;
			console.log(item, data[item]);
		});
	}

	var save_data = function () {
		console.log('called function save_data');
		data_items.forEach(function(item, index, array) {
			localStorage.setItem(item, data[item]);
			console.log(item, data[item]);
		});
	}

	var update_screen = function () {
		console.log('called function update_screen');
		data_items.forEach(function(item, index, array) {
			$("#data_"+item).html(data[item]);
			console.log(item, data[item]);
		});
	}

	var initialize_data = function () {
		console.log('called function initialize_data');
		// initialize all data_items to zero
		data_items.forEach(function(item, index, array) {
			data[item] = 0;
		});
		// then set particular values
		data['filament'] = 10;
		data['kits'] = 1;
		data['version'] = 1;
	}

	load_data();

	if (!data.version) {
		initialize_data();
		save_data();
	}

	setup_leftbar();

	update_screen();

});
