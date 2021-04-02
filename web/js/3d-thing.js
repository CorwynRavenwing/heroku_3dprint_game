/* 3dprint_game/js/3d-thing.js */

class Thing {
	name       = null;
	print_time = null;
	build_time = null;
	price      = null;
	desc       = null;

	constructor(p_name, p_print, p_build, p_price, p_desc) {
		this.name       = p_name;
		this.print_time = p_print;
		this.build_time = p_build;
		this.price      = p_price;
		this.desc       = p_desc;

		console.log("called Thing.constructor()", p_name, p_print, p_build, p_price, p_desc);
	}
} // end class Thing

class Things {
	thing_store = {};

	constructor() {
		// non-physical:
		this.create('time',               0,   0,   0.00, "Time")
		this.create('version',            0,   0,   0.00, "Version")
		this.create('money',              0,   0,   0.00, "Money")
		// neither printed nor built:
		this.create('kwh',                0,   0,   0.10, "kWh")
		this.create('filament',           0,   0,  10.00, "Filament")
		this.create('plastic',            0,   0,   5.00, "Plastic")
		// printed:
		this.create('doodad',            10,   0,   0.50, "Doodad")
		this.create('doohickey',         50,   0,   3.00, "Doohickey")
		this.create('thingamabob',      200,   0,  10.00, "Thingamabob")
		this.create('thingy',          1000,   0, 100.00, "Fiendish Thingy")
		// printed as X-kit, then built:
		this.create_2('printer',          500, 200, 300.00, "Printer")
		this.create_2('helpinghands',     100, 100, 500.00, "Helping Hands")
		this.create_2('extruder',        1000, 100, 300.00, "Extruder")
		this.create_2('shredder',        2000, 200, 200.00, "Shredder")
	}

	create(p_name, p_print, p_build, p_price, p_desc) {
		if (! this.get(p_name)) {
			var ob = new Thing(p_name, p_print, p_build, p_price, p_desc);
			this.put(p_name, ob);
		}
	}

	create_2(p_name, p_print, p_build, p_price, p_desc) {
		this.create(p_name+'-kit', p_print,       0, p_price*0.75, p_desc+' Kit')
		this.create(p_name       ,       0, p_build, p_price     , p_desc       )
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
				outputs_array.push("printer");
				outputs_array.push("helpinghands");
				break;

			case "print":
				outputs_array.push("doodad");
				outputs_array.push("doohickey");
				outputs_array.push("printer-kit");
				outputs_array.push("helpinghands-kit");
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
