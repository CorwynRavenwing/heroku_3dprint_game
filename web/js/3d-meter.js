/* 3dprint_game/js/3d-meter.js */

var meters   = [];

class Meter {
	data_object = null;

	data_id  = null;
	meter_id = null;

	constructor(label, item, data_object) {
		this.data_object = data_object;
		this.data_id  = item;
		var meter_id = 'meter_'+item;
		this.meter_id = '#'+meter_id;

		var L = $(".leftbar");
		var outerdiv = $('<div>')
			.html(label+':&nbsp;')
			.addClass("meter");
		var innerdiv = $('<div>')
			.text('?')
			.attr('id', meter_id)
		outerdiv.append(innerdiv);
		L.append(outerdiv);

		data_object.setItem(item, 0);
		meters.push(this);
	}

	update_display() {
		var meter_ob = $(this.meter_id);
		var value = this.data_object.getItem(this.data_id);
		value = parseFloat(value);
		value = Math.round( value * 1000 ) / 1000;
		console.log('Meter: updating display', this.data_id, value);
		meter_ob.html(value);
		if (value == 0) {
			meter_ob.parent().addClass('zero');
		} else {
			meter_ob.parent().removeClass('zero');
		}
	}
} //  end class Meter

var setup_meters = function () {
	var M;

	var leftbar_labels = {
		"time":             "Time",
		'version':          "Version",
		'money':            "Money",
		'filament':         "Filament",
		'plastic':          "Plastic",
		'kwh':              "kW-h Used",
		'printer-kit':      "Printer Kit",
		'printer':          "Printer",
		'helpinghands-kit': "Helping Hands Kit",
		'helpinghands':     "Helping Hands",
	};

	Object.keys(leftbar_labels).forEach(function(item, index) {
		M = new Meter(leftbar_labels[item], item, D);
	});
}
