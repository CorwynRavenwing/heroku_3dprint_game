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
			data[index] = localStorage.getItem(index);
			console.log(index, data[index]);
		});
	}

	var save_data = function () {
		console.log('called function save_data');
		data_items.forEach(function(item, index, array) {
			localStorage.setItem(index, data[index]);
			console.log(index, data[index]);
		});
	}

	var update_screen = function () {
		console.log('called function update_screen');
		data_items.forEach(function(item, index, array) {
			$("#data_"+index).html(data[index]);
			console.log(index, data[index]);
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
