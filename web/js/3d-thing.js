/* 3dprint_game/js/3d-thing.js */

class Thing {
	name       = null;
	print_time = null;
	build_time = null;
	buy_price  = null;
	sell_price = null;
	desc       = null;

	constructor(p_name, p_print, p_build, p_buyprice, p_sellprice, p_desc) {
		this.name       = p_name;
		this.print_time = p_print;
		this.build_time = p_build;
		this.buy_price  = p_buyprice;
		this.sell_price = p_sellprice;
		this.desc       = p_desc;

		console.log("called Thing.constructor()", p_name, p_print, p_build, p_buyprice, p_sellprice, p_desc);
	}
} // end class Thing

class Things {
	thing_store = {};
	printable_list = [];
	buildable_list = [];
	buyable_list   = [];
	sellable_list  = [];

	constructor() {
		// non-physical:
		this.create('money',                0,   0,    0.00,   0.00, "Money")
		this.create('time',                 0,   0,    0.00,   0.00, "Time")
		this.create('version',              0,   0,    0.00,   0.00, "Version")
		// neither printed nor built:
		this.create('bottle',               0,   0,    5.00,   0.00, "Empty Milk Bottle")
		this.create('filament',             0,   0,   10.00,   5.00, "Filament")
		this.create('kwh',                  0,   0,    0.10,   0.05, "kWh")
		this.create('plastic',              0,   0,    5.00,   5.00, "Plastic")
		// printed:
		this.create('doodad',              10,   0,    0.00,   0.50, "Doodad")
		this.create('doohickey',           50,   0,    0.00,   3.00, "Doohickey")
		this.create('thingamabob',        200,   0,    0.00,  10.00, "Thingamabob")
		this.create('thingy',            1000,   0,    0.00, 100.00, "Fiendish Thingy")
		// printed as X-kit, then built:
		this.create_2('extruder',        1000, 100, 3000.00, 300.00, "Extruder")
		this.create_2('helpinghands',    1000, 500, 5000.00, 500.00, "Helping Hands")
		this.create_2('printer',          500, 250, 3000.00, 300.00, "Printer")
		this.create_2('shredder',        2000, 200, 2000.00, 200.00, "Shredder")
	}

	create(p_name, p_print, p_build, p_buyprice, p_sellprice, p_desc) {
		if (! this.get(p_name)) {
			var ob = new Thing(p_name, p_print, p_build, p_buyprice, p_sellprice, p_desc);
			this.put(p_name, ob);
			if (p_print) {
				printable_list.push(p_name);
			}
			if (p_build) {
				buildable_list.push(p_name)
			}
			if (p_buyprice) {
				buyable_list.push(p_name);
			}
			if (p_sellprice) {
				sell_name = p_name+'-ship';
				sell_desc = 'Sell a '+p_desc;
				this.create(sell_name, 0, 0, 0, 0, sell_desc);
				sellable_list.push(sell_name);
			}
		}
	}

	create_2(p_name, p_print, p_build, p_buyprice, p_sellprice, p_desc) {
		this.create(p_name+'-kit', p_print,       0, p_buyprice*0.75, p_sellprice*0.75, p_desc+' Kit')
		this.create(p_name       ,       0, p_build, p_buyprice     , p_sellprice     , p_desc       )
	}

	get(p_name) {
		return this.thing_store[p_name];
	}

	put(p_name, ob) {
		this.thing_store[p_name] = ob;
	}

	possible_outputs(machine_type) {
		var outputs_array = [];

		switch (machine_type) {
			case "build":
				outputs_array = this.buildable_list;
				break;

			case "extrude":
				outputs_array.push("filament");
				break;

			case "print":
				outputs_array = this.printable_list;
				break;

			case "ship":
				outputs_array = this.sellable_list;
				break;

			case "buyer":
				outputs_array = this.buyable_list;
				break;

			case "recycle":
				outputs_array.push("bottle")
				break;

			case "shred":
				outputs_array.push("plastic")
				break;

			case "empty":
				break;

			default:
				break;

		} // end switch

		return outputs_array;
	}

} // end class Things

var T3d = new Things();
