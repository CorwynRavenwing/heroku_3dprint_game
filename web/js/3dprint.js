/* 3dprint_game/js/3dprint.js */

// Uses 'Blocks3d = new Blocks' from 3d-block.js
// uses 'Data3d = new Data()' from 3d.data.js
// Uses 'Menus3d = new Menus()' from 3d-menu.js
// Uses 'Meters3d = new Meters()' from 3d-meter.js

var update_screen = function () {
	Data3d.update_display();
	Machines3d.update_display();
	Blocks3d.update_display();
	Meters3d.update_display();
}

var announce = function (announcement) {
	var announce_block = $('#announce');
	var newblock = $('<div>')
		.addClass('announce')
		.html(announcement);
	announce_block
		.append(newblock);
	var n = announce_block
		.children()
		.length;
	if (n > 5) {
		announce_block
			.find(':first-child')
			.remove();
	}
}

var clear_all_data = function () {
	Data3d.clearAll();
	load_data();
	// update_screen();
}

var load_data = function () {
	Data3d.loadAll();
	update_screen();
}

var save_data = function () {
	Data3d.saveAll();
}

var heart_beat = function() {
	Data3d.heart_beat();
	Machines3d.heart_beat();
	update_screen();
}

var hb_object = null;
var hb_ticks = 10000;	// 1000;
var toggle_heart_beats = function() {
	console.log('called function toggle_heart_beats()');
	if (hb_object) {
		console.log('--- stopping heart beat');
		clearInterval(hb_object);
		hb_object = null;
	} else {
		console.log('+++ starting heart beat');
		hb_object = setInterval(heart_beat, hb_ticks);
	}
}

var initialize_data = function () {
	announce("Initializing ...");

	Machines3d.reset();
	Data3d.setItem('filament',   10);
	Data3d.setItem('printer-kit', 1);
	Data3d.setItem('version',  0.09);
}

$(document).ready(function() {
	if (typeof(Storage) === "undefined") {
		$(".blocks").html("Sorry! No Web Storage support. You need a more recent browser.");
		return;
	}

	Menus3d.setup_menus();
	Meters3d.setup_meters();
	Blocks3d.setup_blocks();

	load_data();

	if (!Data3d.getNumber('version')) {
		initialize_data();
		save_data();
		announce("Welcome to the 3D Printer game.");
	} else {
		announce("Welcome back!");
	}

	update_screen();
	save_data();
	toggle_heart_beats();
});
