/* 3dprint_game/js/3dprint.js */

var data = {};	// move definition here to let console see 'data' object

$(document).ready(function() {
	if (typeof(Storage) === "undefined") {
		$(".main").html("Sorry! No Web Storage support. You need a more recent browser.");
		return;
	}

	var leftbar_labels = {
		'version':  "Version",
		'money':    "Money",
		'filament': "Filament",
		'plastic':  "Plastic",
		'electric': "Electric",
		'kits':     "Kits",
		'printers': "Printers",
	};

	var leftbar_items = Object.keys(leftbar_labels);

	var Blocks = 15;

	var block_list = [];
	var block_data = [];
	var x;
	for (x = 0; x < Blocks; x++) {
		var block_id = 'block_'+x;
		block_list.push( block_id );
		block_data.push( 'data_'+block_id+'_type' );
	}

	block_items = block_data;

	var data_items = [].concat(leftbar_items, block_items);

	var setup_leftbar = function () {
		console.log('called function setup_leftbar');
		var L = $(".leftbar");

		leftbar_items.forEach(function(item, index, array) {
			var label = leftbar_labels[item]+': ';
			var outerdiv = $('<div>'+label+'</div>').addClass("data");
			var innerdiv = $('<div id="data_'+item+'">0</div>');
			outerdiv.append(innerdiv);
			L.append(outerdiv);
		});
	}

	var setup_main = function () {
		console.log('called function setup_main');
		var M = $(".main");

		block_list.forEach(function(block, index, array) {
			var outerdiv = $('<div id="'+block+'">(B'+index+')</div>').addClass("block");
			var innerdiv = $('<div id="data_'+block+'_type>'+block+'_type</div>').addClass("type");
			outerdiv.append(innerdiv);
			M.append(outerdiv);
		});
	}

	var load_data = function () {
		console.log('called function load_data');
		data_items.forEach(function(item, index, array) {
			temp = localStorage.getItem(item);
			if (temp === null) {
				console.log("fixed", item, temp, "->", 0);
				temp = 0;
			}
			data[item] = temp;
		});
	}

	var save_data = function () {
		console.log('called function save_data');
		data_items.forEach(function(item, index, array) {
			localStorage.setItem(item, data[item]);
		});
	}

	var update_screen = function () {
		console.log('called function update_screen');
		data_items.forEach(function(item, index, array) {
			$("#data_"+item).html(data[item]);
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
	setup_main();

	update_screen();

});
