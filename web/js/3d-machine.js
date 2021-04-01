/* 3dprint_game/js/3d-machine.js */

var machines = [];

class Machine {

	// data_object = null;
	block_id = null;
	block_ob = null;
	machine_type = null;
	error_message = "";

	/*
	 * @input block_id
	 *	the ID of the new block, of form "block_28"
	 * @input machine_type
	 *	the type of machine this is:
	 *		"buyer"		(TODO free: turns money into any Buyable)
	 *		"boxer"		(TODO free: turns any Salable X into X-boxed)
	 *		"build"		(     free: turns X-kit into X)
	 *		"empty"		(     free: a block doing nothing)
	 *		"extrude"	(TODO extruder: turns plastic into filament)
	 *		"mail"		(TODO free: exchanges any Salable X-boxed for money)
	 *		"print"		(     printer: turns filament into any Printable)
	 *		"recycle"	(TODO free: fetches milk-bottles)
	 *		"shred"		(TODO shredder: turns milk-bottles into plastic)
//	 * @input data_object
//	 *	a link to the object of class Data in which we are storing local data
	 * @input is_new
	 *	TRUE if machine is being created by user action
	 *		(therefore set variables to initial or default values)
	 *	FALSE if machine is being loaded from save file
	 * 		(therefore set variables from save file also)
	 */
	constructor(block_id, machine_type, data_object, is_new) {
		console.log('called Machine constructor()', block_id, machine_type, is_new);
		this.block_id = block_id;
		// this.data_object = data_object;
		var current_type = D3d.getItem(block_id+'_type');
		if ( current_type === "empty" ) {
			console.log('OK: block current type empty:', current_type);
		} else if ( current_type === machine_type ) {
			console.log('OK: block current type correct:', current_type);
		} else {
			console.log('error: ['+block_id+'_type]', current_type, 'should be', "empty", 'or', machine_type);
			// should throw an error here
			return;
		}

		this.machine_type = machine_type;
		D3d.setItem(block_id+'_type', machine_type);

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
				case "empty":
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
			var temp = D3d.getItem(data_id);
			if (temp === "0") {
				temp = 0;
			} else if (parseFloat(temp)) {
				temp = parseFloat(temp);
				temp = Math.round( temp * 1000 ) / 1000;
			}
			// else return string as-is
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
			D3d.setItem(data_id, value);
		}

		set_run(value) {
			return this.set_value('running', value);
		}
		
		set_input(value) {
			return this.set_value('input', value);
		}

		add_input(value) {
			var old_input = this.get_input();
			return this.set_input(old_input + value);
		}

		subtract_input(value) {
			return this.add_input(-value);
		}
		
		set_output(value) {
			return this.set_value('output', value);
		}

		set_time(value) {
			return this.set_value('time', value);
		}

		add_time(value) {
			var old_time = this.get_time();
			return this.set_time(old_time + value);
		}

		subtract_time(value) {
			return this.add_time(-value);
		}
		
		set_auto(value) {
			return this.set_value('auto', value);
		}

	// helper functions
		possible_outputs() {
			var outputs_list = {};

			outputs_list["Please Choose"]="?";

			switch (this.machine_type) {
				case "build":
					outputs_list["Printer"]="printer";
					break;

				case "print":
					outputs_list["Doodad"]="doodad";
					outputs_list["Printer Kit"]="printer-kit";
					outputs_list["Helping Hands Kit"]="helpinghands-kit";
					break;

				case "empty":
					this.error_message = "empty machine has no output";
					return {};
					break;

				default:
					this.error_message = "unknown machine has no output";
					return {};
					break;

			} // end switch

			this.error_message = "";
			return outputs_list;
		}

	// CAN section
		can_run() {
			if (! this.get_input()) 	  {
				this.error_message = "Can't run if no input";
				return 0;
			}
			if (this.get_output() == "?") {
				this.error_message = "Can't run if no output";
				return 0;
			}
			this.error_message = "";
			return 1;
		}
		
		can_input() {
			if (this.get_output() == "?") {
				this.error_message = "Can't input if no output";
				return 0;
			}
			var input_available = 0;
			switch (this.machine_type) {
				case "build":
					var build_source = this.get_output() + '-kit';
					input_available = D3d.getNumber(build_source);
					this.error_message = "Not enough "+build_source+" available ("+input_available+")";
					return (input_available >= 1);
					break;

				case "print":
					input_available = D3d.getNumber('filament');
					this.error_message = "Not enough "+'filament'+" available ("+input_available+")";
					return (input_available >= 1);
					break;

				case "empty":
					this.error_message = "empty machine has no input";
					return 0;
					break;
				default:
					this.error_message = "unknown machine has no input";
					return 0;
					break;
			} // end switch
			this.error_message = "";
			return 1;
		}
		
		// I can't imagine a reason to ever not allow setting output
		can_output() {
			this.error_message = "";
			return 1;
		}

		// can_time() // no such function 
		
		can_auto() {
			if (this.get_output() == "?") {
				this.error_message = "can't automate if no output";
				return 0;
			}
			if (D3d.getNumber('helpinghands') < 1) {
				this.error_message = "need Helping Hands to automate";
				return 0;
			}
			this.error_message = "";
			return 1;
		}

	// ACT section
		act_run_off() {
			this.set_run(0);
			// leave remaining time on the clock
		}

		act_run_on() {
			this.set_run(1);
			if (! this.get_time()) {
				var time_required = 10;		// this number should depend on type,output?
				this.set_time(time_required);
			}
			// else just finish the current timer
		}

		act_run() {
			console.log('called machine act_run()');
			if (this.get_run()) {
				this.act_run_off();
			} else if (this.can_run()) {
				this.act_run_on();
			} else {
				announce( this.error_message );
			}
		}

		act_input_source() {
			var build_source = "";
			switch (this.machine_type) {
				case "build":
					build_source = this.get_output() + '-kit';
					break;

				case "print":
					build_source = 'filament';
					break;

				default:
					build_source = 'INVALID';
					break;
			} // end switch

			return build_source;
		}

		act_input_off() {
			if (this.get_input()) {
				var build_source = this.act_input_source();
				var current_input = this.get_input();
				announce("returning "+current_input+" "+build_source+" to stock");
				D3d.add(build_source, current_input);
				this.subtract_input(current_input);
			}
		}

		act_input_on() {
			var build_source = this.act_input_source();
			announce("adding 1 "+build_source+" to input");
			D3d.subtract(build_source, 1);
			this.add_input(1)
		}
		
		act_input() {
			console.log('called machine act_input()');
			if (this.get_input()) {
				this.act_input_off();
			} else if (this.can_input()) {
				this.act_input_on();
			} else {
				announce( this.error_message );
				return;
			}
		}

		act_output_off() {
			this.act_auto_off();
			this.act_run_off();
			this.act_input_off();
			this.set_output("?");
		}

		act_output_on() {
			var self = this;
			var headline = "Choose Output"
			var outputs_list = this.possible_outputs();

			var success_fn = function (value, text) {
				if (value == "?") {
					announce("Okay, canceled");
				} else {
					announce("Okay, starting to make "+text);
				}
				self.set_output(value);
				update_screen();
			};

			chooser(headline, outputs_list, "?", success_fn);
		}
		
		act_output() {
			if (this.get_output() != "?") {
				this.act_output_off();
			} else if (this.can_output()) {
				this.act_output_on();
			} else {
				announce( this.error_message );
				return;
			}
		}

		// act_time() // no such function

		act_auto_off() {
			if (this.get_auto()) {
				D3d.add('helpinghands', 1);
				this.set_auto(0);
			}
		}

		act_auto_on() {
			D3d.subtract('helpinghands', 1);
			this.set_auto(1);
		}
		
		act_auto() {
			if (this.get_auto()) {
				this.act_auto_off();
			} else if (this.can_auto()) {
				this.act_auto_on();
			} else {
				announce( this.error_message );
				return;
			}
		}

	// OTHER FUNCTIONS section
		update_display() {
			console.log('// called Machine.update_display');
		}

		shutdown_commands() {
			console.log('called Machine.shutdown_commands()', this.block_id);
			var B = this.block_ob;

			B.set_type("empty");

			B.set_value('running', null);
			B.set_value('input'  , null);
			B.set_value('output' , null);
			B.set_value('time'   , null);
			B.set_value('auto'   , null);
		}

		heart_beat() {
			console.log('called Machine.heart_beat()', this.block_id);

			// if auto, set a bunch of things here

			if (this.get_run()) {
				if (this.get_input() <= 0) {
					announce("Ran out of input: stopping");
					this.set_run(0);
				} else {
					this.subtract_time(1);
					// printers use input incrementally
					if (this.machine_type == "print") {
						this.subtract_input(0.001);
						announce("... used 0.001 filament");
						D3d.add('kwh',0.001);
					}
					if (this.get_time() <= 0) {
						// non-printers use input all at once
						if (this.machine_type != "print") {
							this.subtract_input(1);
							announce("... used 1 input object");
						}
						var my_output = this.get_output();
						announce("... created a "+my_output);
						D3d.add(my_output, 1);
						this.set_time(0);
						this.set_run(0);
					}
				}
			} // endif get_run

			// should call update here
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
