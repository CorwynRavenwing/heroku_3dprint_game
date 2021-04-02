/* 3dprint_game/js/3d-block.js */

// uses 'D3d = new Data()'' from 3d-data.js

var blocks   = {};

class Block {
	block_ob = null;
	machine_ob = null;
	machine_type = null;
	block_id = null;

	constructor(group, row, column) {
		var block_id = 'block_'+group+'_'+row+'_'+column;
		this.block_id = block_id;
		var row_id = "g"+group+"r"+row
		var BR = $(".blocks #"+row_id);
		if (! BR.length) {
			var group_id = "g"+group
			var BG = $(".blocks #"+group_id);
			if (! BG.length) {
				console.error("Can't find Block Group with ID "+group_id);
				return;
			}
			BR = $('<div>')
				.attr('id', row_id)
				.addClass("block_row");
			BG
				.append(BR);
		}
		var blocktype_label = block_id+'_type';
		var self = this;

		this.block_ob = $('<div>')
			.text('('+block_id+')')
			.attr('id', block_id)
			.addClass("block")
			.addClass('type_empty');
		var innerdiv = $('<div>')
			.attr('id', 'div_'+blocktype_label)
			.addClass("type");
		var labelspan = $('<span>')
			.text('[type]')
			.attr('id', 'data_'+blocktype_label);
		var innerspan = $('<span>')
			.text('NEW')
			.attr('id', 'act_'+block_id+'_change')
			.click(function() { self.action_dispatch('change'); });
		innerdiv
			.append(labelspan)
			.append('&nbsp;')
			.append(innerspan);
		this.block_ob.append(innerdiv);
		BR.append(this.block_ob);

		this.set_type("empty");

		blocks[block_id] =this;
	}

	// what types of machine are currently possible?
	blocktype_list() {
		var outputs_list = {};

		outputs_list["Select One"]="?";

		outputs_list["Builder"]="build";
		outputs_list["Printer"]="print";
		outputs_list["Mail"]   ="mail";

		return outputs_list;
	}

	// what object gets consumed creating each type of machine?
	blocktype_source(new_type) {
		var retVal = "";
		switch (new_type) {
			case "build":   retVal = "nothing"; break;
			case "print":   retVal = "printer"; break;
			case "mail":    retVal = "nothing"; break;
			default:
				console.log('block '+this.block_id+' called blocktype_source: invalid new_type '+new_type);
				break;
		}
		return retVal;
	}

	set_type(new_type) {
		var blocktype_label = this.block_id+'_type';
		var old_type = this.machine_type;
		D3d.setItem(blocktype_label, new_type);

		console.log('called Block.set_type()', this.block_id, old_type, '->', new_type);

		this.block_ob
			.removeClass('type_'+old_type)
			.addClass('type_'+new_type);

		this.machine_type = new_type;
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
		act_ob.html(new_label);
	}

	action_dispatch(subtype) {
		console.log('block '+this.block_id+' called A_D('+subtype+')');

		switch (subtype) {
			case 'change':
				if (this.machine_type == "empty") {
					// currently empty: create a block

					var self = this;
					var headline = "Choose Block Machine"
					var outputs_list = this.blocktype_list();

					var success_fn = function (value, text) {
						if (value == "?") {
							announce("Okay, canceled");
						} else {
							var build_source = self.blocktype_source(value);
							var input_available = 0;
							if (build_source == "nothing") {
								input_available = 1;
							} else {
								input_available = D3d.getNumber(build_source);
							}
							if (input_available < 1) {
								announce("Not enough "+build_source+" available ("+input_available+")");
							} else {
								announce("Okay, setting this block up as a "+text);
								if (build_source == "nothing") {
									announce("... for free");
								} else {
									D3d.subtract(build_source, 1);
								}
								var M = new Machine(self.block_id, value, true);
							}
						}
						update_screen();
					};

					chooser(headline, outputs_list, "?", success_fn);
				} else {
					// currently non-empty: clear machine
					announce("sorry, can't clear blocks yet")
				}
				break;
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
		update_screen();
	}
	
	act_input() {
		this.machine_ob.act_input();
		update_screen();
	}
	
	act_output() {
		this.machine_ob.act_output();
		update_screen();
	}
	
	act_auto() {
		this.machine_ob.act_auto();
		update_screen();
	}

	update_display() {
		// console.log('called Block.update_display');
		this.set_action_label('change',
			(this.machine_type == "empty")
			? '(+)'
			: '(&times;)'
		);
		if (this.machine_ob) {
			this.set_action_label('running',
				(this.get_value('running'))
				? '(-)'
				: '(+)'
			);
			this.set_action_label('input',
				(this.get_value('input') > 0)
				? '(-)'
				: '(+)'
			);
			this.set_action_label('output',
				(this.get_value('output') == "?")
				? '(+)'
				: '(&times;)'
			);
			this.set_action_label('auto',
				(this.get_value('auto'))
				? '(-)'
				: '(+)'
			);
			this.set_action_label('time', '');
		} // endif machine_ob
	}
} // end class Block

var setup_block_group = function(group, group_label, hide, rows, cols) {
	var group_id = "g"+group
	var BG = $(".blocks #"+group_id);

	if (! BG.length) {
		BG = $('<div>')
			.html(group_label)
			.attr('id', group_id)
			.addClass("block_group");
		if (hide) {
			BG.addClass('hide');
		}
		$(".blocks")
			.append(BG);
	}

	var r, c, B;

	for (r = 0; r < rows; r++) {
		for (c = 0; c < cols; c++) {
			B = new Block(group, r, c);
			var block_id = B.block_id;
			// blocks[block_id] = B;
		}
	}
}

var setup_blocks = function () {
	var groups = 3;
	var rows, cols, g, r, c, B;
	for (g = 0; g < groups; g++) {
		if (g == 0) {
			rows = 2;
			cols = 4;
		} else {
			rows = 4;
			cols = 5;
		}

		var group_label, hide;

		if (g) {
			group_label = 'Warehouse #'+g;
			hide = true;
		} else {
			group_label = 'Your <strike>Basement</strike> Home Office';
			hide = false;
		}

		setup_block_group(g, group_label, hide, rows, cols);
	}
}
