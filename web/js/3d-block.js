/* 3dprint_game/js/3d-block.js */

// uses 'Data3d = new Data()' from 3d-data.js
// uses 'Machines3d = new Machines()' from 3d-machine.js

console.log('file 3d-block.js: start');

class BlockType {
	block_type = null;
	source     = null;
	desc       = null;

	constructor(p_type, p_source, p_desc) {
		this.block_type = p_type;
		this.source     = p_source;
		this.desc       = p_desc;
	}
} // end class BlockType

class BlockTypes {
	blocktype_data = {};

	constructor() {
		this.create("build",   "",         "Builder");
		this.create("print",   "printer",  "Printer");
		this.create("ship",    "",         "Shipper");
		this.create("buyer",   "",         "Buyer");
		this.create("extrude", "extruder", "Extruder")
		this.create("recycle", "",         "Recycler")
		this.create("shred",   "shredder", "Shredder");
		// this.create(p_type, p_source, p_desc);
	}

	create(p_type, p_source, p_desc) {
		if (! this.get(p_type)) {
			var ob = new BlockType(p_type, p_source, p_desc);
			this.put(p_type, ob);
		}
	}

	get(p_type) {
		return this.blocktype_data[p_type];
	}

	put(p_type, ob) {
		this.blocktype_data[p_type] = ob;
	}

	blocktype_list() {
		return Object.keys(this.blocktype_data);
	}
} // end class BlockTypes

BlockTypes3d = new BlockTypes

class Block {
	block_ob = null;
	machine_ob = null;
	machine_type = null;
	block_id = null;

	constructor(group, row, column, block_id) {
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
			.attr('id', block_id)
			.addClass("block")
			.addClass('type_empty');

		this.add_display(this.block_ob, 'change', 'label');

		/* @todo: begin delete section */
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
		/* @todo: end delete section */
		BR.append(this.block_ob);

		this.add_section('output' , 'Make' );

		this.add_switch(this.block_ob, 'automate', 'Automate', false);
		this.add_switch(this.block_ob, 'autorun',  'Auto:run', false);
		this.add_switch(this.block_ob, 'running',  'Run',      false);

		this.add_section('input',    'Input');
		this.add_section('time',     'Time' );

		this.set_type("empty");
	}

	// what types of machine are currently possible?
	blocktype_list() {
		var outputs_list = {};
		var outputs_array = BlockTypes3d.blocktype_list();

		if (! outputs_array.length) {
			// this.error_message = "no possible blocktypes";
			console.log('block '+this.block_id+' called blocktype_list: no block types available');
			return {};
		}

		outputs_list["Select Type of Block"]="?";

		self = this;
		outputs_array.forEach(function(item){
			var ob = BlockTypes3d.get(item);
			var item_desc = null;

			if (ob) {
				item_desc = ob.desc;
			} else {
				console.log('block '+self.block_id+' called blocktype_list: invalid block_type '+item);
				item_desc = "["+item+"]";
			}

			outputs_list[item_desc] = item;
		});
		// this.error_message = "";

		return outputs_list;
	}

	// what object gets consumed creating each type of machine?
	blocktype_source(new_type) {
		var retVal = "";
		var ob = BlockTypes3d.get(new_type);
		if (ob) {
			retVal = ob.source;
		} else {
			console.log('block '+this.block_id+' called blocktype_source: invalid new_type '+new_type);
			retVal = "INVALID";
		}
		return retVal;
	}

	set_type(new_type) {
		var blocktype_label = this.block_id+'_type';
		var old_type = this.machine_type;
		Data3d.setItem(blocktype_label, new_type);

		this.block_ob
			.removeClass('type_'+old_type)
			.addClass('type_'+new_type);

		this.machine_type = new_type;
	}

	register_machine(machine_ob) {
		console.log('called Block.register_machine()', this.block_id);
		this.machine_ob = machine_ob;
	}

	get_switch_id(subtype) {
		return this.block_id+'_'+subtype+'_switch';
	}

	add_switch(location_dom, subtype, hovertext, is_checked) {
		var self = this;
		var switch_id = this.get_switch_id(subtype);
		var label_dom = $('<label>')
			.addClass("switch")
			.addClass(subtype)
			.attr('for', switch_id)
			.click(function() { self.clicked_switch(subtype); });
		var input_dom = $('<input>')
			.attr('id', switch_id)
			.attr('type', 'checkbox')
			.prop('checked', is_checked)
			.appendTo(label_dom);
		var span_dom = $('<span>')
			.addClass("slider")
			.addClass("round")
			.attr('title', hovertext)
			.appendTo(label_dom);
		location_dom
			.append(label_dom);
	}

	get_switch(subtype) {
		var switch_id = this.get_switch_id(subtype);
		var switch_dom = $('#'+switch_id);
		var switch_on = switch_dom.is(":checked");
		return switch_on;
	}

	set_switch(subtype, value) {
		var switch_id = this.get_switch_id(subtype);
		$('#'+switch_id)
			.prop('checked', value);	// value should be true/false
	}

	set_class_if(class_ob, class_name, value) {
		if (value) {
			if (! class_ob.hasClass(class_name)) {
				console.log('... adding class '+class_name);
				class_ob.addClass(class_name);
			}
		} else {
			if (class_ob.hasClass(class_name)) {
				console.log('... removing class '+class_name);
				class_ob.removeClass(class_name);
			}
		}
	}

	set_switch_label(subtype, value) {
		value = (!! value);		// convert to boolean
		var old_value = this.get_switch(subtype);
		if (old_value !== value) {
			console.warn('block '+this.block_id+' S_S_L('+subtype+','+value+') DIFF:', old_value, value);
			this.set_switch(subtype, value);
		}
		this.set_class_if(this.block_ob, subtype+"_on",    value);
		this.set_class_if(this.block_ob, subtype+"_off", (!value));
	}

	clicked_switch(subtype) {
		console.log('block '+this.block_id+' called C_S('+subtype+')');
		var switch_id = this.get_switch_id(subtype);
		var switch_dom = $('#'+switch_id);
		var switch_on = switch_dom.is(":checked");
		console.log('... value is now "'+switch_on+'"');
		var retVal = false;

		if (this.machine_type != "empty") {
			switch(subtype) {
				case 'running':
					retVal = this.act_run_NEW(switch_on);
					break;
				case 'autorun':
					retVal = this.act_autorun_NEW(switch_on);
					break;
				case 'automate':
					retVal = this.act_automate_NEW(switch_on);
					break;
				default:
					console.error('... invalid subtype '+subtype);
					break;
			}
		} else {
			// clicking switches on empty blocks always fails
			retVal = false;
		}
		if (! retVal) {
			console.log("C_S() returned false: reversing switch value");
			console.log("... before: ", switch_dom.is(":checked"), switch_on );
			switch_dom.prop('checked', (! switch_on) );
			console.log("... after: ", switch_dom.is(":checked") );
		}
	}

	build_action_span(dom, label, subtype, control, hovertext) {
		var action = $('<span>')
			.text(label)
			.attr('title', hovertext)
			.attr('id', 'actspan_'+this.block_id+'_'+subtype+'_'+control)
			.addClass('actspan')
			.click(function() { self.action_dispatch_NEW(subtype, control); });
		dom.append(action);
	}

	add_display(dom, subtype, hovertext) {
		switch (subtype) {
			case "input":
				this.build_action_span(dom, '(0)', subtype, 'zero',  'Clear input');
				this.build_action_span(dom, '(-)', subtype, 'minus', '-1 input');
				dom.append('&nbsp;&nbsp;&nbsp;');
				break;

			case "output":
			case "change":
			case "time":
				break;
		}

		var inner = $('<span>')
			.attr('id', 'display_'+this.block_id+'_'+subtype)
			.attr('title', hovertext)
			.text("NEW");
		dom.append(inner);

		switch (subtype) {
			case "input":
				dom.append('&nbsp;&nbsp;&nbsp;');
				this.build_action_span(dom, '(+)', subtype, 'add',   '+1 input');
				this.build_action_span(dom, '(*)', subtype, 'max',   'Max input');
				break;

			case "output":
				dom.append('&nbsp;&nbsp;&nbsp;');
				this.build_action_span(dom, '(×)', subtype, 'clear', 'Clear output');
				this.build_action_span(dom, '(+)', subtype, 'set',   'Set output');
				break;

			case "change":
				dom.append('&nbsp;&nbsp;&nbsp;');
				this.build_action_span(dom, '(×)', subtype, 'clear', 'Clear block type');
				this.build_action_span(dom, '(+)', subtype, 'set',   'Set block type');
				break;

			case "time":
				break;
		}
	}

	add_section_NEW(subtype, hovertext) {
		var self=this;
		var outer = $('<div>')
			.attr('id', 'section_'+this.block_id+'_'+subtype)
			.addClass(subtype);

		this.add_display(outer, subtype, hovertext);

		this.block_ob.append(outer);
	}

	add_section(subtype, label_rename_hovertext) {
		this.add_section_NEW(subtype, label_rename_hovertext);		// call other function too

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
		outer.append(label_rename_hovertext+':&nbsp;');
		outer.append(inner);
		outer.append('&nbsp;');
		outer.append(action);
		this.block_ob.append(outer);
	}

	get_value(subtype) {
		return this.machine_ob.get_value(subtype);
	}

	set_value(subtype, value) {
		this.machine_ob.set_value(subtype, value);
	}

	hide_action_span(subtype, control, hide) {
		var act_label_id = '#actspan_'+this.block_id+'_'+subtype+'_'+control;
		var act_ob = $(act_label_id);

		this.set_class_if(act_ob, "hide", hide);
	}

	set_action_label_NEW(subtype, new_label) {
		var act_label_id = '#display_'+this.block_id+'_'+subtype;
		var act_ob = $(act_label_id);
		console.log(">>> SAL_N() ", act_label_id, act_ob, act_ob.length);
		if (act_ob.html() != new_label) {
			console.log("... SAL_N() ", act_ob.html(), new_label);
			act_ob.html(new_label);
			console.log("... SAL_N() ", act_ob.html(), '<-check');
		}
	}

	set_action_label(subtype, new_label) {
		var act_label_id = '#act_'+this.block_id+'_'+subtype;
		var act_ob = $(act_label_id);
		if (act_ob.html() != new_label) {
			console.log(">>> SAL() ", act_ob.html(), new_label);
			act_ob.html(new_label);
		}
	}

	action_dispatch_NEW(subtype, control) {
		console.log('block '+this.block_id+' called A_D_NEW('+subtype+','+control+')');




	}

	action_dispatch(subtype) {
		console.log('block '+this.block_id+' called A_D('+subtype+')');


		if (this.machine_type == "empty") {
			switch (subtype) {
				case 'change':
					// currently empty: create a block
					var self = this;
					var headline = "Choose Block Machine"
					var outputs_list = this.blocktype_list();

					var block_success_fn = function (value, text) {
						if (value == "?") {
							announce("Okay, canceled");
						} else {
							var build_source = self.blocktype_source(value);
							var input_available = 0;
							if (build_source == "") {
								input_available = 1;
							} else {
								input_available = Data3d.getNumber(build_source);
							}
							if (input_available < 1) {
								announce("Not enough "+build_source+" available ("+input_available+")");
							} else {
								announce("Okay, setting this block up as a "+text);
								if (build_source == "") {
									// announce("... for free");
								} else {
									Data3d.subtract(build_source, 1);
									announce("... using 1 "+build_source);
								}
								Machines3d.create(self.block_id, value, true);
							}
						}
						update_screen();
					};

					chooser(headline, outputs_list, "?", block_success_fn);
					break;

				case 'running':
				case 'input':
				case 'output':
				case 'autorun':
				case 'automate':
					console.log("don't click buttons on empty machines");
					break;

				case 'time':
				default:
					console.log('block '+this.block_id+' called A_D: invalid subtype '+subtype);
					break;
			} // end switch subtype
		} else {
			// machine_type not "empty"
			switch (subtype) {
				case 'change':
					// currently non-empty: clear machine
					var build_source = this.blocktype_source(this.machine_type);
					this.machine_ob.act_output_off();
					this.machine_ob.shutdown_commands();
					Machines3d.remove(this.block_id);
					announce("Okay, cleared this block");
					if (build_source) {
						Data3d.add(build_source, 1);
						announce("... put 1 "+build_source+" back in stock");
					} else {
						announce("... (which was free)");
					}
					update_screen();
					break;

				case 'running':
					this.act_run_OLD();
					break;

				case 'input':
					this.act_input();
					break;

				case 'output':
					this.act_output();
					break;

				case 'autorun':
					this.act_autorun_OLD();
					break;

				case 'automate':
					this.act_automate_OLD();
					break;

				case 'time':
				default:
					console.log('block '+this.block_id+' called A_D: invalid subtype '+subtype);
					break;
			} // end switch subtype
		} // endif machine_type
	}

	act_run_NEW(value) {
		var retVal = this.machine_ob.act_run_NEW(value);
		update_screen();
		return retVal;
	}

	act_run_OLD() {
		this.machine_ob.act_run_OLD();
		update_screen();
	}

	act_automate_NEW(value) {
		var retVal = this.machine_ob.act_automate_NEW(value);
		update_screen();
		return retVal;
	}

	act_autorun_NEW(value) {
		var retVal = this.machine_ob.act_autorun_NEW(value);
		update_screen();
		return retVal;
	}

	act_automate_OLD() {
		this.machine_ob.act_automate_OLD();
		update_screen();
	}

	act_autorun_OLD() {
		this.machine_ob.act_autorun_OLD();
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

	update_display() {
		// console.log('called Block.update_display');
		this.set_action_label_NEW('change',
			this.machine_type
		);
		this.hide_action_span('change', 'clear', (this.machine_type == "empty"));
		this.hide_action_span('change', 'set',   (this.machine_type != "empty"));
		// @todo: delete next line
		this.set_action_label('change',
			(this.machine_type == "empty")
			? '(+)'
			: '(×)'
		);
		if (this.machine_ob) {
			this.set_switch_label('automate', this.get_value('automate'));
			// @todo: delete next line
			this.set_action_label('automate',
				(this.get_value('automate'))
				? '(-)'
				: '(+)'
			);

			this.set_switch_label('autorun', this.get_value('autorun'));
			// @todo: delete next line
			this.set_action_label('autorun',
				(this.get_value('autorun'))
				? '(-)'
				: '(+)'
			);

			// @todo: delete next line
			this.set_action_label('running',
				(this.get_value('running'))
				? '(-)'
				: '(+)'
			);
			this.set_switch_label('running', this.get_value('running'));

			this.set_action_label_NEW('input',
				this.get_value('input')
			);
			this.hide_action_span('input', 'zero',  false); // if value = 0
			this.hide_action_span('input', 'minus', false); // if value < quantum
			this.hide_action_span('input', 'plus',  false); // if avail < quantum
			this.hide_action_span('input', 'max',   false); // if avail = 0
			// @todo: delete next line
			this.set_action_label('input',
				(this.get_value('input') > 0)
				? '(-)'
				: '(+)'
			);

			var output = this.get_value('output');
			var output_ob = Thing3d.get(output);
			this.set_action_label_NEW('output',
				(output_ob)
				? output_ob.desc
				: "Output: ?" + ' ['+output+']'
			);
			this.hide_action_span('output', 'clear', (output == "empty"))
			this.hide_action_span('output', 'set',   (output != "empty"))
			// @todo: delete next line
			this.set_action_label('output',
				(output == "?")
				? '(+)'
				: '(×)'
			);

			// 'time' has no action spans to hide or show
			this.set_action_label_NEW('time',
				this.get_value('time')
			);
			// @todo: delete next line
			this.set_action_label('time', '');
		} // endif machine_ob
	}
} // end class Block

class Blocks {
	block_store = {};

	constructor() {
		// unsure what to do here yet
	}

	create(group, row, column) {
		var block_id = 'block_'+group+'_'+row+'_'+column;

		if (! this.get(block_id)) {
			var ob = new Block(group, row, column, block_id);
			this.put(block_id, ob);
		}
	}

	get(block_id) {
		return this.block_store[block_id];
	}

	put(block_id, ob) {
		this.block_store[block_id] = ob;
	}

	update_display() {
		self = this;
		Object.keys(self.block_store).forEach(function(block_id) {
			var b = self.block_store[block_id];
			b.update_display();
		});
	}

	setup_block_group(group, group_label, hide, rows, cols) {
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
				this.create(group, r, c);
			}
		}
	}

	setup_blocks() {
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

			this.setup_block_group(g, group_label, hide, rows, cols);
		}
	}
} // end class Blocks

Blocks3d = new Blocks();

// @TODO: unroll thes functions back to where they are used:
var blocks_update_display_RENAME_ISTHISUSED = function () {
}

var setup_block_group_RENAME_ISTHISUSED = function(group, group_label, hide, rows, cols) {
	// Blocks3d.setup_block_group(group, group_label, hide, rows, cols);
}

var setup_blocks_RENAME_ISTHISUSED = function () {
}

console.log('file 3d-block.js: end');
