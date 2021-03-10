/* 3dprint_game/js/3dprint.js */

var data = {};

$(document).ready(function() {
	if (typeof(Storage) === "undefined") {
		$(".main").html("Sorry! No Web Storage support. You need a more recent browser.");
		return;
	}

	var data_items = [
		'filament',
		'kits',
		'printers',
		'version',
	]

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

	var begin = function () {
		console.log('called function begin');
		data['filament'] = 10;
		data['kits'] = 1;
		data['version'] = 1;
	}

	load_data();

	if (!data.version) {
		begin();
		save_data();
	}

	update_screen();

});
