/* 3dprint_game/js/3dprint.js */

var data = {};
var machines = [];

const BLANK = "BLANK";		// @todo: make this "" at some later time

class Machine {

	input  = "variable initialize";
	output = "variable initialize";
	time   = "variable initialize";
	auto   = "variable initialize";

	/*
	 * @input block_id
	 *	the ID of the new block, of form "block_28"
	 * @input machine_type
	 *	the type of machine this is: currently "blank", "build", "print"
	 * @input is_new
	 *	TRUE if machine is being created by user action
	 *		(therefore set variables to initial or default values)
	 *	FALSE if machine is being loaded from save file
	 * 		(therefore set variables from save file also)
	 */
	constructor(block_id, machine_type, is_new) {
		console.log('called Machine constructor()', block_id, machine_type, is_new);
		this.block_id = block_id;
		var current_type = data[block_id+'_type'];
		if ( current_type === BLANK ) {
			console.log('OK: block current type blank:', current_type);
		} else if ( current_type === machine_type ) {
			console.log('OK: block current type correct:', current_type);
		} else {
			console.log('error: data['+block_id+'_type]', data[block_id+'_type'], 'should be', BLANK, 'or', machine_type);
			// should throw an error here
			return;
		}
		data[block_id+'_type'] = machine_type;

		var innerdiv;
		var outerdiv = $('#'+block_id)
			.removeClass('type_blank')
			.addClass('type_'+machine_type);
		innerdiv = $('<div>temp</div>')
			.attr('id', 'data_'+block_id+'_input')
			.addClass("input");
		outerdiv.append(innerdiv);
		innerdiv = $('<div>temp</div>')
			.attr('id', 'data_'+block_id+'_output')
			.addClass("output");
		outerdiv.append(innerdiv);
		innerdiv = $('<div>temp</div>')
			.attr('id', 'data_'+block_id+'_time')
			.addClass("time");
		outerdiv.append(innerdiv);
		innerdiv = $('<div>temp</div>')
			.attr('id', 'data_'+block_id+'_auto')
			.addClass("auto");
		outerdiv.append(innerdiv);

		if (is_new) {
			// drop default values here

		data[block_id+'_input' ] = "UNKNOWN";
			data[block_id+'_output'] = "UNKNOWN";
			data[block_id+'_time'  ] = "UNKNOWN";
			data[block_id+'_auto'  ] = "UNKNOWN";

			this.machine_type = machine_type;

			switch (machine_type) {
				case "blank":
					data[block_id+'_input' ] = null;
					data[block_id+'_output'] = null;
					data[block_id+'_time'  ] = null;
					data[block_id+'_auto'  ] = null;
					break;

				case "build":
					data[block_id+'_input' ] = "0";
					data[block_id+'_output'] = "printer";
					data[block_id+'_time'  ] = "0";
					data[block_id+'_auto'  ] = "0";
					break;

				case "print":
					data[block_id+'_input' ] = "0";
					data[block_id+'_output'] = "???";
					data[block_id+'_time'  ] = "0";
					data[block_id+'_auto'  ] = "0";
					break;

				// other cases go here

				default:
					data[block_id+'_input' ] = "???";
					data[block_id+'_output'] = "???";
					data[block_id+'_time'  ] = "???";
					data[block_id+'_auto'  ] = "???";
					break;
			} // end switch
		}

		this.input  = data[block_id+'_input' ];
		this.output = data[block_id+'_output'];
		this.time   = data[block_id+'_time'  ];
		this.auto   = data[block_id+'_auto'  ];
	
		machines.push(this);
	}

	update_display() {
		x();
	}

	shutdown_commands() {
		console.log('called Machine shutdown_commands()', this.block_id);
		data[this.block_id+'_type'  ] = BLANK;
		data[this.block_id+'_input' ] = null;
		data[this.block_id+'_output'] = null;
		data[this.block_id+'_time'  ] = null;
		data[this.block_id+'_auto'  ] = null;

		$('#'+this.block_id)
			.removeClass('type_'+this.machine_type)
			.addClass('type_blank');

		$('#data_'+this.block_id+'_input' ).remove();
		$('#data_'+this.block_id+'_output').remove();
		$('#data_'+this.block_id+'_time'  ).remove();
		$('#data_'+this.block_id+'_auto'  ).remove();
	}

	// other Machine code here ...
}

var reset_machines = function () {
	console.log('called reset_machines');

	var shutdown_machine = function (m, i) {
		console.log('...shutting down machine #', i, m.block_id);
		m.shutdown_commands();
	}

	/* OLD WAY -- WHY DOES THIS NOT WORK?
	machines.forEach( shutdown_machine );
	*/
	/* NEW WAY */
	for (var i=0; i<machines.length; i++) {
		var m = machines[i];
		shutdown_machine(m, i);
	}
	console.log('...clearing machines list');
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
		// @todo: might want to do the following in Machine.create() instead
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

		menudiv = $('<div>CLEAR</div>')
			.addClass("menu")
			.click(function() { clear_all_data();	});
		L.append(menudiv);

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

		leftbar_items.forEach(function(item, index) {
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

		block_list.forEach(function(block, index) {
			var outerdiv = $('<div>(B'+index+')</div>')
				.attr('id', block)
				.addClass("block")
				.addClass('type_blank');
			innerdiv = $('<div>'+block+'_type</div>')
				.attr('id', 'data_'+block+'_type')
				.addClass("type");
			outerdiv.append(innerdiv);
			B.append(outerdiv);
		});
	}

	var clear_all_data = function () {
		console.log('called function clear_all_data');
		data_items.forEach(function(item, index) {
			console.log('DELETE', item);
			localStorage.removeItem(item);
		});
	}

	var load_data = function () {
		console.log('called function load_data');
		reset_machines();

		Object.keys(localStorage).forEach(function(item, index) {
			data[item] = localStorage.getItem(item);
		});
		block_list.forEach(function(block_id, index) {
			blocktype = data[block_id+'_type'];
			if (blocktype !== BLANK) {
				var m = new Machine(block_id, blocktype, false);
			}
		});
	}

	var save_data = function () {
		console.log('called function save_data');
		Object.keys(data).forEach(function(item, index) {
			if (data[item] === null) {
				console.log('data null for item, removing:', item, data[item])
				localStorage.remove(item);
			} else {
				// console.log('data exists for item, saving', item, data[item])
				localStorage.setItem(item, data[item]);
			}
		});
	}

	var update_screen = function () {
		console.log('called function update_screen');
		data_items.forEach(function(item, index) {
			$('#data_'+item).html(data[item]);
		});
	}

	var initialize_data = function () {
		console.log('called function initialize_data');
		// initialize all leftbar_items to zero
		leftbar_items.forEach(function(item, index) {
			data[item] = 0;
		});
		// initialize all block_items to BLANK
		block_items.forEach(function(item, index) {
			data[item] = BLANK;
		});
		// then set particular values
		data['filament'] = 10;
		data['kits'] = 1;
		data['version'] = 1;
		var m = new Machine('block_10', 'build', true);
	}

	setup_leftbar();
	setup_blocks();

	load_data();

	if (!data.version) {
		initialize_data();
		save_data();
	}

	update_screen();

	save_data();

});
