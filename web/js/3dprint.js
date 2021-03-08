/* 3dprint_game/js/3dprint.js */

$(document).ready(function() {
	if (typeof(Storage) === "undefined") {
		$(".main").html("Sorry! No Web Storage support. You need a more recent browser.");
		return;
	}

	var data = {};

	var load_data = function () {
		console.log('called function load_data');
		data['filament'] = localStorage.getItem('filament');
	}

	var save_data = function () {
		console.log('called function save_data');
		localStorage.setItem('filament', data['filament']);
	}

	var update_screen = function () {
		console.log('called function update_screen');
		$("#data_filament").html(data['filament']);
		$("#data_kits").html(data['kits']);
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
