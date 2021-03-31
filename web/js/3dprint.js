/* 3dprint_game/js/3dprint.js */

var update_screen = function () {
	D.update_display();

	for (var i=0; i<machines.length; i++) {
		var m = machines[i];
		m.update_display();
	}

	Object.keys(blocks).forEach(function(block_id) {
		var b = blocks[block_id];
		b.update_display();
	});
}

var announce = function (announcement) {
	$('.announce')
		.html(announcement);
}

var chooser = function (headline, choices, current_value, callback) {
	$('.chooser').show();
	var choose_head = $('.chooser .header')
		.text(headline);
	var choose_body = $('.chooser .body');
	var selector = $('<select>')
		.attr("id", "chooser_selector")
		.appendTo(choose_body);

	Object.keys(choices).forEach(function(optionText){
		var optionValue = choices[optionText];
		var opt = $('<option>')
			.val(optionValue)
			.text(optionText)
			.appendTo(selector);
		if (optionValue == current_value) {
			opt.attr("selected", "selected");
		}
	});

	var hide_chooser = function () {
		choose_head.text("[headline]");
		selector.remove();
		$('.chooser').hide();
	}

	$('.chooser #ok').click(function(){
		var chosen_option = selector.find("option:selected");
		var text  = chosen_option.text();
		var value = chosen_option.val();

		callback(value, text);
		hide_chooser();
	});

	$('.chooser #cancel').click(function(){
		hide_chooser();
	});
}

$(document).ready(function() {
	if (typeof(Storage) === "undefined") {
		$(".blocks").html("Sorry! No Web Storage support. You need a more recent browser.");
		return;
	}

	var clear_all_data = function () {
		D.clearAll();
		load_data();
		// update_screen();
	}

	var load_data = function () {
		D.loadAll();
		update_screen();
	}

	var save_data = function () {
		D.saveAll();
	}

	var heart_beat = function() {
		D.heart_beat();
		machines_heart_beats();
		update_screen();
	}

	var initialize_data = function () {
		announce("Initializing ...");

		reset_machines();
		D.setItem('filament',   10);
		D.setItem('printer-kit', 1);
		D.setItem('version',  0.09);
		var M = new Machine('block_10', 'build', D, true);

		announce("Welcome to the 3D Printer game.");
	}

	setup_menus();
	setup_meters();
	setup_blocks();

	load_data();

	if (!D.getNumber('version')) {
		initialize_data();
		save_data();
	}

	update_screen();

	save_data();
});
