/* 3dprint_game/js/3d-meter.js */

// uses 'Data3d = new Data()' from 3d-data.js
// uses 'Thing3d = new Things()' from 3d-things.js

class Meter {
	data_id  = null;
	meter_id = null;

	previous_value = "NEW";

	constructor(item) {
		this.data_id  = item;
		var meter_id = 'meter_'+item;
		this.meter_id = '#'+meter_id;

		var thing = Thing3d.get(item)
		var label = thing.desc;

		var lb = $(".leftbar");
		var outerdiv = $('<div>')
			.html(label+':&nbsp;')
			.addClass("meter");
		var innerdiv = $('<div>')
			.text('?')
			.attr('id', meter_id)
		outerdiv.append(innerdiv);
		lb.append(outerdiv);

		Data3d.create(item);
	}

	update_display() {
		var meter_ob = $(this.meter_id);
		var value = Data3d.getItem(this.data_id);
		if (parseFloat(value)) {
			value = parseFloat(value);
			value = Data3d.round(value, 1000);
		}
		if (this.previous_value != value) {
			this.previous_value = value;

			switch(this.data_id) {
				case "money":
					value = Data3d.format_money(value);
					break;
				case "kwh":
					value = value.toFixed(3);
					break;
				case "version":
					value = value.toFixed(2);
					break;
				case "filament":
					value = value + " m";
					break;
				case "plastic":
					value = value + " g";
					break;
				case "time":
					var tmp = value;
					var min = tmp % 60;	tmp = Math.floor(tmp / 60);
					var hr  = tmp % 24;	tmp = Math.floor(tmp / 24);
					var day = tmp % 30;	tmp = Math.floor(tmp / 30);
					var mth = tmp % 12;	tmp = Math.floor(tmp / 12);
					var yr  = tmp;
					min = Data3d.pad2(min);
					var ampm = "AM";
					if (hr > 12) {
						hr -= 12;
						ampm = "PM";
					} else if (hr == 0) {
						hr += 12;
					}
					hr  = Data3d.pad2(hr);
					day = Data3d.pad2(day+1);
					mth = Data3d.pad2(mth+1);
					value = "y"+yr+" "
						+mth+"/"
						+day+" "
						+hr+":"
						+min+" "
						+ampm;
					var yymm = "y"+yr+" m"+mth;
					Data3d.setItem("yymm", yymm);
					break;

				default:
					// keep current format
					break;
			}

			meter_ob.html(value);
			if (value == 0) {
				meter_ob.parent().addClass('zero');
			} else {
				meter_ob.parent().removeClass('zero');
			}
		}
	}
} //  end class Meter

class Meters {
	meter_store = {};

	constructor() {
		// nothing to do here yet
	}

	get(p_name) {
		return this.meter_store[p_name];
	}

	put(p_name, ob) {
		this.meter_store[p_name] = ob;
	}

	create_meter(p_name) {
		if (! this.get(p_name)) {
			this.put(p_name, "CREATING");
			var ob = new Meter(p_name);
			this.put(p_name, ob);
		}
	}

	update_display() {
		var self = this;
		Object.keys(self.meter_store).forEach(function(p_name) {
			var m = self.meter_store[p_name];
			m.update_display();
		});
	}

} //  end class Meters

Meters3d = new Meters();

// Function setup_meters() must ONLY be called after document.ready
var setup_meters = function () {
	var leftbar_array = [
		"time",
		'version',
		'money',
		'kwh',
		'filament',
		'plastic',
		'printer-kit',
		'printer',
		// 'helpinghands-kit',
		// 'helpinghands',
	];

	leftbar_array.forEach(function(item) {
		Meters3d.create_meter(item);
	});
}
