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
		this.x('time',               0,   0,   0.00, "Time")
		this.x('version',            0,   0,   0.00, "Version")
		this.x('money',              0,   0,   0.00, "Money")
		// neither printed nor built:
		this.x('kwh',                0,   0,   0.10, "kWh")
		this.x('filament',           0,   0,  10.00, "Filament")
		this.x('plastic',            0,   0,   5.00, "Plastic")
		// printed:
		this.x('doodad',            10,   0,   0.50, "Doodad")
		this.x('doohickey',         50,   0,   3.00, "Doohickey")
		this.x('thingamabob',      200,   0,  10.00, "Thingamabob")
		this.x('thingy',          1000,   0, 100.00, "Fiendish Thingy")
		// printed as X-kit, then built:
		this.y('printer',          500, 200, 300.00, "Printer")
		this.y('helpinghands',     100, 100, 500.00, "Helping Hands")
		this.y('extruder',        1000, 100, 300.00, "Extruder")
		this.y('shredder',        2000, 200, 200.00, "Shredder")
	}

	x(p_name, p_print, p_build, p_price, p_desc) {
		if (! this.get(p_name)) {
			var ob = new Thing(p_name, p_print, p_build, p_price, p_desc);
			this.put(p_name, ob);
		}
	}

	y(p_name, p_print, p_build, p_price, p_desc) {
		this.x(p_name+'-kit', p_print,       0, p_price*0.75, p_desc+' Kit')
		this.x(p_name       ,       0, p_build, p_price     , p_desc       )
	}

	get(p_name) {
		return this.thing_store[p_name];
	}

	put(p_name, ob) {
		this.thing_store[p_name] = ob;
	}
} // end class Things

var T3d = new Things();
