/* 3dprint_game/js/3dprint.js */

var data_RENAMED_BREAK_PLEASE     = {};
var machines = [];
var menus    = [];
var meters   = [];

const BLANK = "BLANK";		// @todo: make this "" at some later time

class Menu {
	constructor(label, click_function) {
		var L = $(".leftbar");
		var menudiv = $('<div>'+label+'</div>')
			.addClass("menu")
			.click(click_function);
		L.append(menudiv);
		menus.push(this);
	}
}

class Meter {
	data_id  = "variable initialize";
	meter_id = "variable initialize";

	constructor(label, item) {
		var L = $(".leftbar");
		this.data_id  = item;
		this.meter_id = 'data_'+item;
		var outerdiv = $('<div>'+label+': '+'</div>')
			.addClass("data");
		var innerdiv = $('<div>?</div>')
			.attr('id', this.meter_id)
		outerdiv.append(innerdiv);
		L.append(outerdiv);
		meters.push(this);
	}

	update_display() {
		var met = $(this.meter_id);
		var dat = D.getItem(this.data_id);
		console.log('Meter: updating display', this.data_id, dat);
		met.html(dat);
	}
}

class Block {
	block_id = "variable initialize";

	constructor(block, index) {
		this.block_id = block;
		var BB = $(".blocks");

		var outerdiv = $('<div>(B'+index+')</div>')
			.attr('id', block)
			.addClass("block")
			.addClass('type_blank');
		var innerdiv = $('<div>[type]</div>')
			.attr('id', 'data_'+block+'_type')
			.addClass("type");
		outerdiv.append(innerdiv);
		BB.append(outerdiv);
		blocks.push(this);
	}

	update_display() {
		var blk = $(this.block_id);
		//var dat = D.getItem(this.data_id);
		//console.log('Block: updating display', this.block_id, dat);
		//blk.html(dat);
	}
}

class Machine {

	running = "variable initialize";
	input   = "variable initialize";
	output  = "variable initialize";
	time    = "variable initialize";
	auto    = "variable initialize";

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
		var current_type = D.getItem(block_id+'_type');
		if ( current_type === BLANK ) {
			console.log('OK: block current type blank:', current_type);
		} else if ( current_type === machine_type ) {
			console.log('OK: block current type correct:', current_type);
		} else {
			console.log('error: ['+block_id+'_type]', current_type, 'should be', BLANK, 'or', machine_type);
			// should throw an error here
			return;
		}
		D.setItem(block_id+'_type', machine_type);

		var innerdiv;
		var outerdiv = $('#'+block_id)
			.removeClass('type_blank')
			.addClass('type_'+machine_type);

		innerdiv = $('<div>[running]</div>')
			.attr('id', 'data_'+block_id+'_running')
			.addClass("running");
		outerdiv.append(innerdiv);

		innerdiv = $('<div>[input]</div>')
			.attr('id', 'data_'+block_id+'_input')
			.addClass("input");
		outerdiv.append(innerdiv);

		innerdiv = $('<div>[output]</div>')
			.attr('id', 'data_'+block_id+'_output')
			.addClass("output");
		outerdiv.append(innerdiv);

		innerdiv = $('<div>[time]</div>')
			.attr('id', 'data_'+block_id+'_time')
			.addClass("time");
		outerdiv.append(innerdiv);

		innerdiv = $('<div>[auto]</div>')
			.attr('id', 'data_'+block_id+'_auto')
			.addClass("auto");
		outerdiv.append(innerdiv);

		if (is_new) {
			// set default values here

			D.setItem(block_id+'_running', "UNKNOWN");
			D.setItem(block_id+'_input'  , "UNKNOWN");
			D.setItem(block_id+'_output' , "UNKNOWN");
			D.setItem(block_id+'_time'   , "UNKNOWN");
			D.setItem(block_id+'_auto'   , "UNKNOWN");

			this.machine_type = machine_type;

			switch (machine_type) {
				case "blank":
					D.setItem(block_id+'_running', null);
					D.setItem(block_id+'_input'  , null);
					D.setItem(block_id+'_output' , null);
					D.setItem(block_id+'_time'   , null);
					D.setItem(block_id+'_auto'   , null);
					break;

				case "build":
					D.setItem(block_id+'_running', "0");
					D.setItem(block_id+'_input'  , "0");
					D.setItem(block_id+'_output' , "printer");
					D.setItem(block_id+'_time'   , "0");
					D.setItem(block_id+'_auto'   , "0");
					break;

				case "print":
					D.setItem(block_id+'_running', "0");
					D.setItem(block_id+'_input'  , "0");
					D.setItem(block_id+'_output' , "?");
					D.setItem(block_id+'_time'   , "0");
					D.setItem(block_id+'_auto'   , "0");
					break;

				// other cases go here

				default:
					D.setItem(block_id+'_running', "?");
					D.setItem(block_id+'_input'  , "?");
					D.setItem(block_id+'_output' , "?");
					D.setItem(block_id+'_time'   , "?");
					D.setItem(block_id+'_auto'   , "?");
					break;
			} // end switch
		}

		this.running= D.getItem(block_id+'_running');
		this.input  = D.getItem(block_id+'_input'  );
		this.output = D.getItem(block_id+'_output' );
		this.time   = D.getItem(block_id+'_time'   );
		this.auto   = D.getItem(block_id+'_auto'   );
	
		machines.push(this);
	}

	update_display() {
		console.log('called Machine.update_display');
	}

	shutdown_commands() {
		console.log('called Machine shutdown_commands()', this.block_id);
		D.setItem(this.block_id+'_type'   , BLANK);
		D.setItem(this.block_id+'_running', null);
		D.setItem(this.block_id+'_input'  , null);
		D.setItem(this.block_id+'_output' , null);
		D.setItem(this.block_id+'_time'   , null);
		D.setItem(this.block_id+'_auto'   , null);

		$('#'+this.block_id)
			.removeClass('type_'+this.machine_type)
			.addClass('type_blank');

		$('#data_'+this.block_id+'_running').remove();
		$('#data_'+this.block_id+'_input'  ).remove();
		$('#data_'+this.block_id+'_output' ).remove();
		$('#data_'+this.block_id+'_time'   ).remove();
		$('#data_'+this.block_id+'_auto'   ).remove();
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

class Data {
	data_store = {};

	constructor() {
		console.log('called Data constructor');
	}

	keys() {
		return Object.keys(data_store);
	}

	getItem(key) {
		return data_store[key];
	}

	setItem(key, value) {
		data_store[key] = value;
	}

	add(key, value) {
		data_store[key] += value;
	}

	subtract(key, value) {
		this.add(key, -value);
	}

	remove(key) {
		this.setItem(key, null);
	}

	saveItem(key) {
		var value = this.getItem(key);
		if (value === null) {
			console.log('value null for item, removing:', key, value)
			localStorage.remove(key);
		} else {
			localStorage.setItem(key, value);
		}
	}

	loadHooks(key) {
		if (key.endsWith('_type')) {
			var block_id = key.replace(/_type/, '');
			var blocktype = this.getItem(key);
			if ((blocktype !== undefined) && (blocktype !== BLANK)) {
				var m = new Machine(block_id, blocktype, false);
			}
		}
	}

	loadItem(key) {
		var value = localStorage.getItem(key);
		this.setItem(key, value);
		this.loadHooks(key);
	}

	saveAll() {
		console.log('called function saveAll');
		this.keys().forEach(function(item, index) {
			this.saveItem(key);
		});
	}

	loadAll() {
		console.log('called function loadAll');
		reset_machines();

		Object.keys(localStorage).forEach(function(item, index) {
			this.loadItem(key);
		});
	}

	clearAll() {
		console.log('called function clearAll');
		this.keys().forEach(function(item, index) {
			console.log('DELETE', item);
			localStorage.removeItem(item);
		});
	}
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
		block_list.push(block_id);
		block_data.push(block_id+'_type');
	}

	block_items = block_data;

	var data_items = [].concat(leftbar_items, block_items);

	var setup_leftbar = function () {
		console.log('called function setup_leftbar');
		var M, D;

		M = new Menu('CLEAR',  clear_all_data	);
		M = new Menu('RESET',  initialize_data	);
		M = new Menu('LOAD',   load_data		);
		M = new Menu('SAVE',   save_data		);
		M = new Menu('UPDATE', update_screen	);

		leftbar_items.forEach(function(item, index) {
			D = new Meter(leftbar_labels[item],item)
		});
	}

	var setup_blocks = function () {
		console.log('called function setup_blocks');
		var B;

		block_list.forEach(function(block, index) {
			B = new Block(block, index);
		});
	}

	var D = new Data();

	var clear_all_data = function () {
		D.clearAll();
	}

	var load_data = function () {
		D.loadAll();
	}

	var save_data = function () {
		D.saveAll();
	}

	var update_screen = function () {
		console.log('called function update_screen');
		data_items.forEach(function(item, index) {
			$('#data_'+item).html(D.getItem(item));
		});
	}

	var initialize_data = function () {
		console.log('called function initialize_data');
		// initialize all leftbar_items to zero
		leftbar_items.forEach(function(item, index) {
			D.setItem(item, 0);
		});
		// initialize all block_items to BLANK
		block_items.forEach(function(item, index) {
			D.setItem(item, BLANK);
		});
		// then set particular values
		D.setItem('filament', 10);
		D.setItem('kits',      1);
		D.setItem('version',   1);
		var m = new Machine('block_10', 'build', true);
	}

	setup_leftbar();
	setup_blocks();

	load_data();

	if (!D.getItem('version')) {
		initialize_data();
		save_data();
	}

	update_screen();

	save_data();

});
