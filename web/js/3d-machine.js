/* 3dprint_game/js/3d-machine.js */

// Uses 'Data3d = new Data' from 3d-data.js
// Uses 'Thing3d = new Things' from 3d-thing.js

class Machine {
	block_id = null;
	block_ob = null;
	output_ob = null;
	machine_type = null;
	error_message = "";

	/*
	 * @input block_id
	 *	the ID of the new block, of form "block_28"
	 * @input machine_type
	 *	the type of machine this is:
	 *		"buyer"		(free: turns money into any Buyable)
	 *		"build"		(free: turns X-kit into X)
	 *		"empty"		(free: a block doing nothing)
	 *		"extrude"	(extruder: turns plastic into filament)
	 *		"print"		(printer: turns filament into any Printable)
	 *		"recycle"	(free: fetches bottle)
	 *		"ship"		(free: exchanges any Salable for money)
	 *		"shred"		(shredder: turns bottle into plastic)
	 * @input is_new
	 *	TRUE if machine is being created by user action
	 *		(therefore set variables to initial or default values)
	 *	FALSE if machine is being loaded from save file
	 * 		(therefore set variables from save file also)
	 */
	constructor(block_id, machine_type, is_new) {
		console.log('called Machine constructor()', block_id, machine_type, is_new);
		this.block_id = block_id;
		var current_type = Data3d.getItem(block_id+'_type');
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
		Data3d.setItem(block_id+'_type', machine_type);

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
					B.set_value('run', null);
					B.set_value('input', null);
					B.set_value('output', null);
					B.set_value('time', null);
					B.set_value('auto', null);
					break;

				case "build":
				case "buyer":
				case "print":
				case "ship":
					B.set_value('run', "0");
					B.set_value('input', "0");
					B.set_value('output', "?");
					B.set_value('time', "0");
					B.set_value('auto', "0");
					break;

				case "extrude":
					B.set_value('run', "0");
					B.set_value('input', "0");
					B.set_value('output', "filament");
					B.set_value('time', "0");
					B.set_value('auto', "0");
					break;

				case "recycle":
					B.set_value('run', "0");
					B.set_value('input', "0");
					B.set_value('output', "bottle");
					B.set_value('time', "0");
					B.set_value('auto', "0");
					break;

				case "shred":
					B.set_value('run', "0");
					B.set_value('input', "0");
					B.set_value('output', "plastic");
					B.set_value('time', "0");
					B.set_value('auto', "0");
					break;

				default:
					B.set_value('run', "0");
					B.set_value('input', "0");
					B.set_value('output', "?");
					B.set_value('time', "0");
					B.set_value('auto', "0");
					break;
			} // end switch
		}

		B.update_display();
	}

	// GET section
		get_value(subtype) {
			var data_id = this.block_id+'_'+subtype;
			var temp = Data3d.getItem(data_id);
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
			Data3d.setItem(data_id, value);
		}

		set_run(value) {
			this.set_value('running', value);
		}

		set_input(value) {
			this.set_value('input', value);
		}

		add_input(value) {
			var old_input = this.get_input();
			this.set_input(old_input + value);
		}

		subtract_input(value) {
			this.add_input(-value);
		}

		set_output(value) {
			this.set_value('output', value);
		}

		act_output_fix() {
			var output = this.get_output();
			this.output_ob = Thing3d.get(output);
		}

		set_time(value) {
			this.set_value('time', value);
		}

		add_time(value) {
			var old_time = this.get_time();
			this.set_time(old_time + value);
		}

		subtract_time(value) {
			this.add_time(-value);
		}

		set_auto(value) {
			this.set_value('auto', value);
		}

	// helper functions
		possible_outputs() {
			var self=this;
			var outputs_list = {};
			var outputs_array = Thing3d.possible_outputs(this.machine_type);

			if (! outputs_array.length) {
				this.error_message = "machine has no possible outputs";
				return {};
			}

			outputs_list["Please Choose"+' ['+self.machine_type+']']="?";

			outputs_array.forEach(function(item){
				var ob = Thing3d.get(item);
				var item_desc = null;
				if (ob) {
					item_desc = ob.desc;
				} else {
					item_desc = "["+item+"]";
				}
				var item_source = "?";
				var item_count = 0;
				var item_price = 0;
				var item_extra = "";
				var item_skip = false;
				switch (self.machine_type) {
					case "build":
						item_source = self.helper_input_source(self.machine_type, item);
						item_count = Data3d.getNumber(item_source);
						item_extra = item_count+" ...";
						break;

					case "buyer":
						item_source = item;
						item_count = Data3d.getNumber(item_source);
						var ob2 = Thing3d.get(item_source);
						item_price = ob2.buy_price;
						item_extra = item_count+" @ "+Data3d.format_money(item_price);
						if (Data3d.getNumber("money") <= item_price) {
							item_skip = true;
						}
						break;

					case "extrude":
						item_source = self.helper_input_source(self.machine_type, item);
						item_count = Data3d.getNumber(item_source);
						item_extra = item_count+" ...";
						break;

					case "print":
						item_source = self.helper_input_source(self.machine_type, item);
						item_count = Data3d.getNumber(item_source);
						item_extra = item_count+" ...";
						break;

					case "ship":
						item_source = self.helper_input_source(self.machine_type, item);
						item_count = Data3d.getNumber(item_source);
						var ob2 = Thing3d.get(item_source);
						item_price = ob2.sell_price;
						item_extra = item_count+" @ "+Data3d.format_money(item_price);
						if (! item_count) {
							item_skip = true;
						}
						break;

					case "recycle":
						item_source = self.helper_input_source(self.machine_type, item);
						item_count = Data3d.getNumber(item_source);
						item_extra = item_count+" ...";
						break;

					case "shred":
						item_source = self.helper_input_source(self.machine_type, item);
						item_count = Data3d.getNumber(item_source);
						item_extra = item_count+" ...";
						break;

					case "empty":
					default:
						console.error("possible_outputs() shouldn't have gotten here, type "+self.machine_type);
						break;
				}
				var item_desc_fancy = '['+item+':'+item_source+']'+item_desc+'('+item_extra+')';
				if (! item_skip) {
					outputs_list[item_desc_fancy] = item;
				}
			});

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
			var build_source = this.act_input_source();
			var input_available = 0;
			var input_required = this.act_input_quantity();
			input_available = Data3d.getNumber(build_source);
			if (input_available >= input_required) {
				this.error_message = "";
				return 1;
			} else {
				this.error_message = "Not enough "+build_source+" available ("+input_available+"/"+input_required+")";
				return 0;
			}
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
			if (Data3d.getNumber('helpinghands') < 1) {
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
			console.log('called machine act_run_on()');
			this.act_output_fix();
			this.set_run(1);
			if (! this.get_time()) {
				var time_required = 0;
				switch (this.machine_type) {
					case "build":
						time_required = this.output_ob.build_time;
						break;

					case "buyer":
						time_required = 30;
						break;

					case "extrude":
						time_required = 60;
						break;

					case "print":
						time_required = this.output_ob.print_time;
						break;

					case "recycle":
						time_required = 300;
						break;

					case "ship":
						time_required = 300;
						break;

					case "shred":
						time_required = 15;
						break;

					default:
						time_required = 1000000;
						this.error_message = "trying to Run with unknown machine type";
						break;
				}
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

		helper_input_source(p_machine_type, p_output) {
			var build_source = "";
			switch (p_machine_type) {
				case "build":
					build_source = p_output + '-kit';
					break;

				case "buyer":
					build_source = 'money';
					break;

				case "extrude":
					build_source = 'plastic';
					break;

				case "print":
					build_source = 'filament';
					break;

				case "recycle":
					build_source = 'minions';
					break;

				case "ship":
					var output = p_output;

					if (output.endsWith('-ship')) {
						build_source = output.replace(/-ship/, '');
					} else {
						console.log("helper_input_source(): invalid build_source, output " + output + "doesn't end with '-ship'");
						build_source = "INVALID";
					}
					break;

				case "shred":
					build_source = 'bottle';
					break;

				default:
					build_source = 'INVALID';
					break;
			} // end switch

			return build_source;
		}

		act_input_source() {
			return this.helper_input_source(this.machine_type, this.get_output());
		}

		act_input_quantity() {
			var input_required = 0;
			switch (this.machine_type) {
				case "build":
				case "print":
				case "ship":
				case "shred":
					input_required = 1;
					break;

				// move "recycle" back into previous section
				// if "minion" ever becomes an actual thing
				// in which case, create N minions during setup
				// and that is now a hard max of recyclers
				// you can run at once, unless you are able
				// to actually *build* minions.
				case "recycle":
					input_required = 0;
					break;

				case "extrude":
					// a meter of filament weighs 2.5 grams
					input_required = 2.5;
					break;

				case "buyer":
					var output = this.get_output();
					var output_ob = Thing3d.get(output);
					var buy_price = output_ob.buy_price;
					input_required = buy_price;
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

			return input_required;
		}

		act_input_off() {
			if (this.get_input()) {
				switch (this.machine_type) {
					case "build":
					case "extrude":
					case "print":
					case "ship":
					case "shred":
						var build_source = this.act_input_source();
						var current_input = this.get_input();
						announce("returning "+current_input+" "+build_source+" to stock");
						Data3d.add(build_source, current_input);
						this.subtract_input(current_input);
						break;

					case "buyer":
						var output = this.get_output();
						var output_ob = Thing3d.get(output);
						var buy_price = output_ob.buy_price;
						announce("returning $"+buy_price+" to petty cash");
						Data3d.add("money", buy_price);
						this.subtract_input(1);
						break;

					case "recycle":
						announce("calling your minions back empty-handed");
						this.subtract_input(1);
						break;

					default:
					console.error("act_input_off(): invalid machine type "+this.machine_type);
					break;
				}
			}
		}

		act_input_on() {
			switch (this.machine_type) {
				case "build":
				case "extrude":
				case "print":
				case "ship":
				case "shred":
					var build_source = this.act_input_source();
					var input_required = this.act_input_quantity();
					announce("input "+input_required+" "+build_source);
					Data3d.subtract(build_source, input_required);
					this.add_input(input_required)
					break;

				case "buyer":
					var output = this.get_output();
					var output_ob = Thing3d.get(output);
					var buy_price = output_ob.buy_price;
					announce("putting aside $"+buy_price+" for a "+output);
					Data3d.subtract("money", buy_price);
					this.add_input(1);
					break;

				case "recycle":
					announce("sending minions out to recycle empty milk bottles");
					this.add_input(1);
					break;

				default:
					console.error("act_input_on(): invalid machine type "+this.machine_type);
					break;
			}
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
			this.set_time(0);
			this.set_output("?");
		}

		act_output_on() {
			var self = this;
			var headline = "Choose Output"
			var outputs_list = this.possible_outputs();

			var output_success_fn = function (value, text) {
				if (value == "?") {
					announce("Okay, canceled");
				} else {
					announce("Okay, chose "+text);
				}
				self.set_output(value);
				if (self.machine_type != "ship") {
					Meters3d.create_meter(value);
				}
				update_screen();
			};

			chooser(headline, outputs_list, "?", output_success_fn);
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
				Data3d.add('helpinghands', 1);
				this.set_auto(0);
			}
		}

		act_auto_on() {
			Data3d.subtract('helpinghands', 1);
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
			// console.log('// called Machine.update_display');
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
			// console.log('called Machine.heart_beat()', this.block_id);

			if (this.get_run()) {
				if (this.get_input() <= 0) {
					announce("Ran out of input: stopping");
					this.set_run(0);
				} else {
					this.subtract_time(1);
					Data3d.add('kwh',0.001);
					var incremental_input = (this.machine_type == "print");
					if (incremental_input) {
						this.subtract_input(0.001);
					}
					if (this.get_time() <= 0) {
						if (! incremental_input) {
							this.subtract_input(1);
							announce("... used 1 input "+this.act_input_source());
						}
						switch (this.machine_type) {

							case "build":
							case "extrude":
							case "print":
								var my_output = this.get_output();
								announce("... created a "+my_output);
								Data3d.add(my_output, 1);
								break;

							case "buyer":
								var my_output = this.get_output();
								announce("... bought a "+my_output);
								Data3d.add(my_output, 1);
								break;

							case "ship":
								var build_source = this.act_input_source();
								var input_ob = Thing3d.get(build_source);
								var sell_price = input_ob.sell_price;
								announce("... sold a "+build_source+" for $"+sell_price);
								Data3d.add("money", sell_price);
								break;

							case "recycle":
								var my_output = this.get_output();
								announce("... fetched a "+my_output);
								Data3d.add(my_output, 1);
								break;

							case "shred":
								// An empty 1-gallon milk jug weighs 60 grams
								var my_output = this.get_output();
								announce("... made some "+my_output);
								Data3d.add(my_output, 60);
								break;

							case "empty":
								break;

							default:
								console.error("Unknown machine type '"+this.machine_type+"' in Machine.heart_beat");
								break;
						}
						this.set_time(0);
						this.set_run(0);
					}
				}
			} // endif get_run

			if (this.get_auto()) {
				// auto-run, if possible
				if (! this.get_run()) {
					if (this.get_input() <= 0) {
						announce('auto: need input first');
					} else if (this.can_run()) {
						announce('auto: run');
						this.act_run_on();
					} else {
						announce('auto: RUN FAIL, '+this.error_message);
						this.act_auto_off();
					}
				}

				// auto-input, if possible
				if (this.get_input() <= 0) {
					if (this.can_input()) {
						announce('auto: input');
						this.act_input_on();
					} else {
						announce('auto: INPUT FAIL, '+this.error_message);
						this.act_auto_off();
					}
				}

				// auto-set output, if possible -- maybe for 'ship' type?

			}

		}

	// other Machine code here ...
} // end class Machine

class Machines {
	machine_store = {};

	constructor() {
		// nothing to do here yet
	}

	create(block_id, machine_type, is_new) {
		if (! this.get(block_id)) {
			var ob = new Machine(block_id, machine_type, is_new);
			this.put(block_id, ob);
		}
	}

	remove(block_id) {
		delete this.machine_store[block_id];
	}

	get(block_id) {
		return this.machine_store[block_id];
	}

	put(block_id, ob) {
		this.machine_store[block_id] = ob;
	}

	reset() {
		console.log('called Machines.reset');

		var shutdown_machine = function (m) {
			console.log('...shutting down machine ', m.block_id);
			m.shutdown_commands();
		}

		var self = this;
		Object.keys(self.machine_store).forEach(function(block_id) {
			var m = self.machine_store[block_id];
			shutdown_machine(m);
		});

		console.log('...clearing machines list');
		this.machine_store = {};
	}

	update_display() {
		var self = this;
		Object.keys(self.machine_store).forEach(function(block_id) {
			var m = self.machine_store[block_id];
			m.update_display();
		});
	}

	heart_beat() {
		var self = this;
		Object.keys(self.machine_store).forEach(function(block_id) {
			var m = self.machine_store[block_id];
			m.heart_beat();
		});
	}
} // end class Machines

Machines3d = new Machines();

var machines = null;				// delete variable after testing
var reset_machines = null;			// delete variable after testing
var machines_heart_beats = null;	// delete variable after testing
