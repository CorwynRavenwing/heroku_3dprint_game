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
}

class Things {
	thing_store = {};

	constructor() {
		// non-physical:
		this.x('time',               0,   0,   0.00, "Time")
		this.x('version',            0,   0,   0.00, "Version")
		this.x('money',              0,   0,   0.00, "Money")
		// neither printed nor built:
		this.x('kwh',                0,   0,   0.10, "kW-h Used")
		this.x('filament',           0,   0,  10.00, "Filament")
		this.x('plastic',            0,   0,   5.00, "Plastic")
		// printed:
		this.x('doodad',            10,   0,   0.50, "Doodad")
		// machines: printed then built:
		this.x('printer-kit',      500,   0, 150.00, "Printer Kit")
		this.x('printer',            0, 200, 300.00, "Printer")
		this.x('helpinghands-kit', 100,   0, 250.00, "Helping Hands Kit")
		this.x('helpinghands',       0, 100, 500.00, "Helping Hands")
	}

	x(p_name, p_print, p_build, p_price, p_desc) {
		if (! this.get(p_name)) {
			var ob = new Thing(p_name, p_print, p_build, p_price, p_desc);
			this.put(p_name, ob);
		}
	}

	get(p_name) {
		return this.thing_store[p_name];
	}

	put(p_name, ob) {
		this.thing_store[p_name] = ob;
	}
}

var T = new Things();
