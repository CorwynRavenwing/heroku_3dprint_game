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
} // end class Menu

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
} //  end class Meter

class Block {
	data_object = null;
	block_ob = null;
	machine_ob = null;

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

	register_machine(machine_ob) {
		console.log('called Block.register_machine()', this.block_id);
		this.machine_ob = machine_ob;
	}

	add_section(subtype, label) {
		var self=this;
		var outer = $('<div>')
			.attr('id', 'section_'+this.block_id+'_'+subtype)
			.addClass(subtype);
		var inner = $('<span>')
			.attr('id', 'data_'+this.block_id+'_'+subtype);
		var action = $('<span>')
			.text('NEW')
			.attr('id', 'act_'+this.block_id+'_'+subtype)
			.click(function() { self.action_dispatch(subtype); });
		outer.append(label+':&nbsp;');
		outer.append(inner);
		outer.append('&nbsp;');
		outer.append(action);
		this.block_ob.append(outer);
	}

	remove_section(subtype) {
		var data_id = this.block_id+'_'+subtype;
		$('#section_'+data_id).remove();
	}

	get_value(subtype) {
		return this.machine_ob.get_value(subtype);
	}

	set_value(subtype, value) {
		this.machine_ob.set_value(subtype, value);
		if (value === null) {
			this.remove_section(subtype);
		}
	}

	set_action_label(subtype, new_label) {
		var act_label_id = '#act_'+this.block_id+'_'+subtype;
		// console.log('set_action_label() called: ', subtype, act_label_id, new_label);
		var act_ob = $(act_label_id);
		act_ob.text(new_label);
	}

	action_dispatch(subtype) {
		console.log('block '+this.block_id+' called A_D('+subtype+')');

		switch (subtype) {
			case 'running':
				this.act_run();
				break;
			case 'input':
				this.act_input();
				break;
			case 'output':
				this.act_output();
				break;
			case 'auto':
				this.act_auto();
				break;
			case 'time':
			default:
				console.log('block '+this.block_id+' called A_D: invalid subtype '+subtype);
				break;
		}
	}

	act_run() {
		this.machine_ob.act_run();
		this.update_display();
	}
	
	act_input() {
		this.machine_ob.act_input();
		this.update_display();
	}
	
	act_output() {
		this.machine_ob.act_output();
		this.update_display();
	}
	
	act_auto() {
		this.machine_ob.act_auto();
		this.update_display();
	}

	update_display() {
		console.log('called Block.update_display');
		// var blk = $(this.block_id);
		this.set_action_label('running',
			(this.get_value('running'))
			? '(-)'
			: '(+)'
		);
		this.set_action_label('input',
			(this.get_value('input') > 0)
			? '(---)'
			: '(+)'
		);
		this.set_action_label('output',
			(this.get_value('output') == "?")
			? '(*)'
			: '(x)'
		);
		this.set_action_label('auto',
			(this.get_value('auto'))
			? '(-)'
			: '(+)'
		);
		this.set_action_label('time', '');
	}
} // end class Block

class Machine {

	data_object = null;
	block_id = null;
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
		B.register_machine(this);

		var innerdiv;
		var outerdiv = $('#'+block_id);

		B.add_section('running', 'Run'  );
		B.add_section('input'  , 'Input');
		B.add_section('output' , 'Make' );
		B.add_section('time'   , 'Time' );
		B.add_section('auto'   , 'Auto' );

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
					B.set_value('running', "0");
					B.set_value('input'  , "0");
					B.set_value('output' , "?");
					B.set_value('time'   , "0");
					B.set_value('auto'   , "0");
					break;
			} // end switch
		}

		B.update_display();
	
		machines.push(this);
	}

	// GET section
		get_value(subtype) {
			var data_id = this.block_id+'_'+subtype;
			var temp = this.data_object.getItem(data_id);
			if (temp === "0")     { temp = 0; }
			if (parseFloat(temp)) { temp = parseFloat(temp); }
			return temp;
		}

		get_run() {
			return this.get_value('running');
		}
		
		get_input() {
			return this.get_value('input');
		}
		
		get_output() {
			return this.get_value('output');
		}

		get_time() {
			return this.get_value('time');
		}
		
		get_auto() {
			return this.get_value('auto');
		}

	// SET section
		set_value(subtype, value) {
			var data_id = this.block_id+'_'+subtype;
			this.data_object.setItem(data_id, value);
		}

		set_run(value) {
			return this.set_value('running', value);
		}
		
		set_input(value) {
			return this.set_value('input', value);
		}
		
		set_output(value) {
			return this.set_value('output', value);
		}

		set_time(value) {
			return this.set_value('time', value);
		}
		
		set_auto(value) {
			return this.set_value('auto', value);
		}

	// CAN section
		can_run() {
			return 1;
		}
		
		can_input() {
			return 1;
		}
		
		can_output() {
			return 1;
		}

		// can_time() // no such function 
		
		can_auto() {
			return 1;
		}

	// ACT section
		act_run() {
			console.log('called machine act_run()');
			if (this.get_run()) {
				this.set_run(0);
			} else if (this.can_run()) {
				this.set_run(1);
			} else {
				announce("can't run, need reason here");
			}
			// this.update_display();
		}
		
		act_input() {
			console.log('called machine act_input()');
			if (this.get_input()) {
				put_it_back;
			} else if (this.can_input()) {
				x;
			} else {
				announce("can't input, need reason here");
				return;
			}
			// this.update_display();
		}
		
		act_output() {
			if (this.get_output() != "?") {
				this.set_output("?");
			} else if (this.can_output()) {
				x;
			} else {
				announce("can't output, need reason here");
				return;
			}
			console.log('called machine act_output()');
			// this.update_display();
		}

		// act_time() // no such function
		
		act_auto() {
			if (this.get_auto()) {
				this.set_auto(0);
			} else if (this.can_auto()) {
				this.set_auto(1);
			} else {
				announce("can't auto, need reason here");
				return;
			}
			console.log('called machine act_auto()');
			// this.update_display();
		}

	// OTHER FUNCTIONS section
	update_display() {
		console.log('called Machine.update_display');
	}

	shutdown_commands() {
		console.log('called Machine.shutdown_commands()', this.block_id);
		var B = this.block_ob;

		B.set_type(EMPTY);

		B.set_value('running', null);
		B.set_value('input'  , null);
		B.set_value('output' , null);
		B.set_value('time'   , null);
		B.set_value('auto'   , null);
	}

	heart_beat() {
		console.log('called Machine.heart_beat()', this.block_id);



	}

	// other Machine code here ...
} // end class Machine

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

var machines_heart_beats = function () {
	console.log('called machines_heart_beats');

	for (var i=0; i<machines.length; i++) {
		var m = machines[i];
		m.heart_beat();
	}
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
			'TICK':   heart_beat,
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

	var heart_beat = function() {
		machines_heart_beats();
	}

	var initialize_data = function () {
		console.log('called function initialize_data');

		reset_machines();
		D.setItem('filament', 10);
		D.setItem('kits',      1);
		D.setItem('version',   1);
		var M = new Machine('block_10', 'build', D, true);
	}

	var announce = function(announcement) {
		$('.announce')
			.html(announcement);
	}

	setup_leftbar();
	setup_blocks();

	load_data();

	if (!D.getItem('version')) {
		announce("Initializing data ...");
		initialize_data();
		save_data();
	}

	update_screen();

	save_data();

});
