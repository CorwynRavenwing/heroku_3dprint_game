/* 3dprint_game/js/3d-meter.js */

// uses 'D3d = new Data()'' from 3d-data.js
// uses 'T3d = new Things()' from 3d-things.js

var meters   = [];

class Meter {
	data_id  = null;
	meter_id = null;

	previous_value = null;

	constructor(item) {
		this.data_id  = item;
		var meter_id = 'meter_'+item;
		this.meter_id = '#'+meter_id;

		var thing = T3d.get(item)
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

		D3d.setItem(item, 0);
		meters.push(this);
	}

	update_display() {
		var meter_ob = $(this.meter_id);
		var value = D3d.getItem(this.data_id);
		value = parseFloat(value);
		value = Math.round( value * 1000 ) / 1000;
		if (this.previous_value != value) {
			console.log('Meter: updating display', this.data_id, value);
			meter_ob.html(value);
			if (value == 0) {
				meter_ob.parent().addClass('zero');
			} else {
				meter_ob.parent().removeClass('zero');
			}
			this.previous_value = value;
		} else {
			console.log('Meter: display was static', value, this.previous_value);
		}
	}
} //  end class Meter

var setup_meters = function () {
	var M;

	var leftbar_array = [
		"time",
		'version',
		'money',
		'kwh',
		'filament',
		'plastic',
		'printer-kit',
		'printer',
		'helpinghands-kit',
		'helpinghands',
	];

	leftbar_array.forEach(function(item, index) {
		M = new Meter(item);
	});
}
