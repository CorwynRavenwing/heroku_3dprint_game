/* 3dprint_game/js/3dprint.js */

// uses 'D3d = new Data()'' from 3d.data.js

var update_screen = function () {
	D3d.update_display();

	for (var i=0; i<machines.length; i++) {
		var m = machines[i];
		m.update_display();
	}

	Object.keys(blocks).forEach(function(block_id) {
		var b = blocks[block_id];
		b.update_display();
	});

	M3d.update_display();

}

var announce = function (announcement) {
	$('.announce')
		.html(announcement);
}

var clear_all_data = function () {
	D3d.clearAll();
	load_data();
	// update_screen();
}

var load_data = function () {
	D3d.loadAll();
	update_screen();
}

var save_data = function () {
	D3d.saveAll();
}

var heart_beat = function() {
	D3d.heart_beat();
	machines_heart_beats();
	update_screen();
}

var hb_object = null;
var hb_ticks = 1000;
var toggle_heart_beats = function() {
	console.log('called function toggle_heart_beats()');
	if (hb_object) {
		console.log('--- stopping heart beat');
		clearInterval(hb_object);
	} else {
		console.log('+++ starting heart beat');
		hb_object = setInterval(heart_beat, hb_ticks);
	}
}

var initialize_data = function () {
	announce("Initializing ...");

	reset_machines();
	D3d.setItem('filament',   10);
	D3d.setItem('printer-kit', 1);
	D3d.setItem('version',  0.09);
	var M = new Machine('block_10', 'build', D3d, true);

	announce("Welcome to the 3D Printer game.");
}

$(document).ready(function() {
	if (typeof(Storage) === "undefined") {
		$(".blocks").html("Sorry! No Web Storage support. You need a more recent browser.");
		return;
	}

	setup_menus();
	setup_meters();
	setup_blocks();

	load_data();

	if (!D3d.getNumber('version')) {
		initialize_data();
		save_data();
	}

	update_screen();

	save_data();
});
