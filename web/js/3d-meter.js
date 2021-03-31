/* 3dprint_game/js/3dprint-meter.js */

var meters   = [];

class Meter {
	data_object = null;

	data_id  = "variable initialize";
	meter_id = "variable initialize";

	constructor(label, item, data_object) {
		this.data_object = data_object;
		this.data_id  = item;
		this.meter_id = 'data_'+item;

		var L = $(".leftbar");
		var outerdiv = $('<div>')
			.text(label+': ')
			.addClass("data");
		var innerdiv = $('<div>')
			.text('?')
			.attr('id', this.meter_id)
		outerdiv.append(innerdiv);
		L.append(outerdiv);

		data_object.setItem(item, 0);
		meters.push(this);
	}

	update_display() {
		var meter_ob = $(this.meter_id);
		var value = this.data_object.getItem(this.data_id);
		console.log('Meter: updating display', this.data_id, value);
		meter_ob.html(value);
		is_this_ever_called();
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
