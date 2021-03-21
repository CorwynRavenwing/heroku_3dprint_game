/* 3dprint_game/js/3dprint.js */

var machines = [];
var menus    = [];
var meters   = [];
var blocks   = {};

const EMPTY = "empty";

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
	data_object = null;

	data_id  = "variable initialize";
	meter_id = "variable initialize";

	constructor(label, item, data_object) {
		this.data_object = data_object;
		this.data_id  = item;
		this.meter_id = 'data_'+item;

		var L = $(".leftbar");
		var outerdiv = $('<div>'+label+': '+'</div>')
			.addClass("data");
		var innerdiv = $('<div>?</div>')
			.attr('id', this.meter_id)
		outerdiv.append(innerdiv);
		L.append(outerdiv);

		data_object.setItem(item, 0);
		meters.push(this);
	}

	update_display() {
		var meter_ob = $(this.meter_id);
		var value = this.data_object.getItem(this.data_id);
		console.log('Meter: updating display', this.data_id, value);
		meter_ob.html(value);
	}
}

class Block {
	data_object = null;
	block_ob = null;

	block_id = "variable initialize";

	constructor(block_id, index, data_object) {
		this.block_id = block_id;
		this.data_object = data_object;
		var BB = $(".blocks");
		var blocktype_label = block_id+'_type';

		this.block_ob = $('<div>(B'+index+')</div>')
			.attr('id', block_id)
			.addClass("block")
			.addClass('type_blank');
		var innerdiv = $('<div>[type]</div>')
			.attr('id', 'data_'+blocktype_label)
			.addClass("type");
		this.block_ob.append(innerdiv);
		BB.append(this.block_ob);

		this.set_type(EMPTY);

		blocks[block_id] =this;
	}

	set_type(new_type) {
		var blocktype_label = this.block_id+'_type';
		var old_type = this.data_object.getItem(blocktype_label);
		this.data_object.setItem(blocktype_label, new_type);

		console.log('called Block.set_type()', this.block_id, old_type, '->', new_type);

		this.block_ob
			.removeClass('type_'+old_type)
			.addClass('type_'+new_type);
	}

	add_section(subtype, label, action_text, action_fn) {
		var outer = $('<div>')
			.attr('id', 'section_'+this.block_id+'_'+subtype)
			.addClass(subtype);
		var inner = $('<span>['+subtype+']</span>')
			.attr('id', 'data_'+this.block_id+'_'+subtype);
		var action = $('<span>')
			.text(action_text)
			.click(function() {alert('should call action function '+action_fn+' here');});
		outer.append(label+':&nbsp;');
		outer.append(inner);
		outer.append(action);
		this.block_ob.append(outer);
	}

	set_value(subtype, value) {
		var data_id = this.block_id+'_'+subtype;
		this.data_object.setItem(data_id, value);
		if (value === null) {
			console.log('called Block.set_value(null)', this.block_id, subtype, null);
			$('#section_'+data_id).remove();
		}
	}

	update_display() {
		var blk = $(this.block_id);
		//var dat = this.data_object.getItem(this.data_id);
		//console.log('Block: updating display', this.block_id, dat);
		//blk.html(dat);
	}
}

class Machine {

	data_object = null;
	block_ob = null;

	/*
	 * @input block_id
	 *	the ID of the new block, of form "block_28"
	 * @input machine_type
	 *	the type of machine this is: currently "blank", "build", "print"
	 * @input data_object
	 *	a link to the object of class Data in which we are storing local data
	 * @input is_new
	 *	TRUE if machine is being created by user action
	 *		(therefore set variables to initial or default values)
	 *	FALSE if machine is being loaded from save file
	 * 		(therefore set variables from save file also)
	 */
	constructor(block_id, machine_type, data_object, is_new) {
		console.log('called Machine constructor()', block_id, machine_type, is_new);
		this.block_id = block_id;
		this.data_object = data_object;
		var current_type = this.data_object.getItem(block_id+'_type');
		if ( current_type === EMPTY ) {
			console.log('OK: block current type blank:', current_type);
		} else if ( current_type === machine_type ) {
			console.log('OK: block current type correct:', current_type);
		} else {
			console.log('error: ['+block_id+'_type]', current_type, 'should be', EMPTY, 'or', machine_type);
			// should throw an error here
			return;
		}

		this.machine_type = machine_type;
		this.data_object.setItem(block_id+'_type', machine_type);

		var B = blocks[block_id];
		this.block_ob = B;

		B.set_type(machine_type);

		var innerdiv;
		var outerdiv = $('#'+block_id);

		B.add_section('running', 'Run' , 'ON/OFF'  , 'do_run'   );
		B.add_section('input'  , 'In'  , 'FETCH'   , 'do_input' );
		B.add_section('output' , 'Out' , 'COLLECT' , 'do_output');
		B.add_section('time'   , 'Time', ''        , 'do_time'  );
		B.add_section('auto'   , 'Auto', 'AUTOMATE', 'do_auto'  );

		if (is_new) {
			// set default values here

			switch (machine_type) {
				case "blank":
					B.set_value('running', null);
					B.set_value('input'  , null);
					B.set_value('output' , null);
					B.set_value('time'   , null);
					B.set_value('auto'   , null);
					break;

				case "build":
					B.set_value('running', "0");
					B.set_value('input'  , "0");
					B.set_value('output' , "printer");
					B.set_value('time'   , "0");
					B.set_value('auto'   , "0");
					break;

				case "print":
					B.set_value('running', "0");
					B.set_value('input'  , "0");
					B.set_value('output' , "?");
					B.set_value('time'   , "0");
					B.set_value('auto'   , "0");
					break;

				// other cases go here

				default:
					B.set_value('running', "?");
					B.set_value('input'  , "?");
					B.set_value('output' , "?");
					B.set_value('time'   , "?");
					B.set_value('auto'   , "?");
					break;
			} // end switch
		}
	
		machines.push(this);
	}

	update_display() {
		console.log('called Machine.update_display');
	}

	shutdown_commands() {
		console.log('called Machine shutdown_commands()', this.block_id);
		var B = this.block_ob;

		B.set_type(EMPTY);

		B.set_value('running', null);
		B.set_value('input'  , null);
		B.set_value('output' , null);
		B.set_value('time'   , null);
		B.set_value('auto'   , null);
	}

	// other Machine code here ...
}

var reset_machines = function () {
	console.log('called reset_machines');

	var shutdown_machine = function (m, i) {
		console.log('...shutting down machine #', i, m.block_id);
		m.shutdown_commands();
	}

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
		return Object.keys(this.data_store);
	}

	getItem(key) {
		return this.data_store[key];
	}

	setItem(key, value) {
		this.data_store[key] = value;
	}

	add(key, value) {
		this.data_store[key] += value;
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
			// console.log('setting value for item:', key, value)
			localStorage.setItem(key, value);
		}
	}

	loadHooks(key) {
		if (key.endsWith('_type')) {
			var block_id = key.replace(/_type/, '');
			var blocktype = this.getItem(key);
			if ((blocktype !== undefined) && (blocktype !== EMPTY)) {
				var m = new Machine(block_id, blocktype, this, false);
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

		var self = this;
		this.keys().forEach(function(item) {
			self.saveItem(item);
		});
	}

	loadAll() {
		console.log('called function loadAll');
		reset_machines();

		var self = this;
		Object.keys(localStorage).forEach(function(item) {
			self.loadItem(item);
		});
	}

	clearAll() {
		console.log('called function clearAll');
		this.keys().forEach(function(item) {
			console.log('DELETE', item);
			localStorage.removeItem(item);
		});
	}

	display() {
		console.log('called function Data.display');
		var self = this;
		this.keys().forEach(function(item) {
			console.log('...setting display for item', item);
			$('#data_'+item).html(self.getItem(item));
		});
	}
}

$(document).ready(function() {
	if (typeof(Storage) === "undefined") {
		$(".blocks").html("Sorry! No Web Storage support. You need a more recent browser.");
		return;
	}

	var D = new Data();

	var setup_leftbar = function () {
		console.log('called function setup_leftbar');
		var M;

		var menu_labels = {
			'CLEAR':  clear_all_data,
			'RESET':  initialize_data,
			'LOAD':   load_data,
			'SAVE':   save_data,
			'UPDATE': update_screen,
		};

		Object.keys(menu_labels).forEach(function(item, index) {
			M = new Menu(item, menu_labels[item], D);
		});

		var leftbar_labels = {
			'version':  "Version",
			'money':    "Money",
			'filament': "Filament",
			'plastic':  "Plastic",
			'electric': "Electric",
			'kits':     "Kits",
			'printers': "Printers",
		};

		Object.keys(leftbar_labels).forEach(function(item, index) {
			M = new Meter(leftbar_labels[item], item, D);
		});
	}

	var setup_blocks = function () {
		console.log('called function setup_blocks');
		
		var Blocks = 15;
		var x, B;
		for (x = 0; x < Blocks; x++) {
			var block_id = 'block_'+x;
			B = new Block(block_id, x, D);
		}
	}

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
		D.display();
		// should also run this on Blocks or Machines group
	}

	var initialize_data = function () {
		console.log('called function initialize_data');

		reset_machines();
		D.setItem('filament', 10);
		D.setItem('kits',      1);
		D.setItem('version',   1);
		var M = new Machine('block_10', 'build', D, true);
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
