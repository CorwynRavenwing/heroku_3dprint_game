/* 3dprint_game/js/3dprint.js */

var data = {};
var machines = [];

const BLANK = "BLANK";		// @todo: make this "" at some later time

class Machine {
	constructor(block_id, machine_type) {
		console.log('called Machine constructor()', block_id, machine_type);
		this.block_id = block_id;
		if ( data[block_id+'_type'] !== BLANK ) {
			console.log('error: data[{block_id}_type]', data[block_id+'_type'], 'should be', BLANK);
			die();
		}
		data[block_id+'_type'] = machine_type;
		data[block_id+'_input' ] = "UNKNOWN";
		data[block_id+'_output'] = "UNKNOWN";
		data[block_id+'_time'  ] = "UNKNOWN";
		data[block_id+'_auto'  ] = "UNKNOWN";
		this.machine_type = machine_type;

		machines.push(this);
	}

	destruct() {
		console.log('called Machine destruct()', this.block_id);
		data[block_id+'_type'  ] = BLANK;
		data[block_id+'_input' ] = BLANK;
		data[block_id+'_output'] = BLANK;
		data[block_id+'_time'  ] = BLANK;
		data[block_id+'_auto'  ] = BLANK;
	}

	// other Machine code here ...
}

var reset_machines = function () {
	console.log('called reset_machines');
	machines.forEach(function(m,index,array) {
		m.destruct();
	});
	machines = [];
}

$(document).ready(function() {
	if (typeof(Storage) === "undefined") {
		$(".blocks").html("Sorry! No Web Storage support. You need a more recent browser.");
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
		block_data.push( block_id+'_type'   );
		block_data.push( block_id+'_input'  );
		block_data.push( block_id+'_output' );
		block_data.push( block_id+'_time'   );
		block_data.push( block_id+'_auto'   );
	}

	block_items = block_data;

	var data_items = [].concat(leftbar_items, block_items);

	var setup_leftbar = function () {
		console.log('called function setup_leftbar');
		var L = $(".leftbar");
		var menudiv;

		menudiv = $('<div>RESET</div>')
			.addClass("menu")
			.click(function() { initialize_data();	});
		L.append(menudiv);

		menudiv = $('<div>LOAD</div>')
			.addClass("menu")
			.click(function() { load_data();		});
		L.append(menudiv);

		menudiv = $('<div>SAVE</div>')
			.addClass("menu")
			.click(function() { save_data();		});
		L.append(menudiv);

		menudiv = $('<div>UPDATE</div>')
			.addClass("menu")
			.click(function() { update_screen();	});
		L.append(menudiv);

		leftbar_items.forEach(function(item, index, array) {
			var label = leftbar_labels[item]+': ';
			var outerdiv = $('<div>'+label+'</div>')
				.addClass("data");
			var innerdiv = $('<div>0</div>')
				.attr('id', 'data_'+item)
			outerdiv.append(innerdiv);
			L.append(outerdiv);
		});
	}

	var setup_blocks = function () {
		console.log('called function setup_blocks');
		var B = $(".blocks");
		var innerdiv;

		block_list.forEach(function(block, index, array) {
			var outerdiv = $('<div>(B'+index+')</div>')
				.attr('id', block)
				.addClass("block");
			innerdiv = $('<div>'+block+'_type</div>')
				.attr('id', 'data_'+block+'_type')
				.addClass("type");
			outerdiv.append(innerdiv);
			innerdiv = $('<div>'+block+'_input</div>')
				.attr('id', 'data_'+block+'_input')
				.addClass("input");
			outerdiv.append(innerdiv);
			innerdiv = $('<div>'+block+'_output</div>')
				.attr('id', 'data_'+block+'_output')
				.addClass("output");
			outerdiv.append(innerdiv);
			innerdiv = $('<div>'+block+'_time</div>')
				.attr('id', 'data_'+block+'_time')
				.addClass("time");
			outerdiv.append(innerdiv);
			innerdiv = $('<div>'+block+'_auto</div>')
				.attr('id', 'data_'+block+'_auto')
				.addClass("auto");
			outerdiv.append(innerdiv);
			B.append(outerdiv);
		});
	}

	var load_data = function () {
		console.log('called function load_data');
		data_items.forEach(function(item, index, array) {
			temp = localStorage.getItem(item);
			if (temp === null) {
				console.log("fixed", item, temp, "->", BLANK);
				temp = BLANK;
			}
			if (temp === "0") {
				// only temporarily necessary
				console.log("fixed", item, temp, "->", BLANK);
				temp = BLANK;
			}
			data[item] = temp;
		});
		reset_machines();
		block_list.forEach(function(block_id, index, array) {
			blocktype = data[block_id+'_type'];
			if (blocktype === BLANK) {
				console.log("blocktype was blank", blocktype);
			} else {
				console.log("blocktype was non-blank", blocktype);
				var m = new Machine(block_id, blocktype);
			}
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
			$('#data_'+item).html(data[item]);
		});
	}

	var initialize_data = function () {
		console.log('called function initialize_data');
		// initialize all data_items to zero
		data_items.forEach(function(item, index, array) {
			data[item] = BLANK;
		});
		// then set particular values
		data['filament'] = 10;
		data['kits'] = 1;
		data['version'] = 1;
		var m = new Machine('block_10', 'build');
	}

	load_data();

	if (!data.version) {
		initialize_data();
		save_data();
	}

	setup_leftbar();
	setup_blocks();

	update_screen();

	save_data();

});
