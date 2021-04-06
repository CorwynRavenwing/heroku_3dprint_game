/* 3dprint_game/js/3d-data.js */

// Uses 'Meters3d = new Meters()' from 3d-meter.js
// Uses 'Machines3d = new Machines()' from 3d-machine.js

class Data {
	data_store = {};

	constructor() {
		console.log('called Data constructor');
	}

	keys() {
		return Object.keys(this.data_store);
	}

	getItem(key) {
		return this.data_store[key];
	}

	getNumber(key) {
		var temp = parseFloat(this.getItem(key));
		temp = this.round(temp, 1000);
		return temp;
	}

	setItem(key, value) {
		this.data_store[key] = value;
		if (! key.startsWith("block_")) {
			Meters3d.create_meter(key);
		}
	}

	add(key, value) {
		this.setItem(key, this.getNumber(key) + value);
	}

	subtract(key, value) {
		this.add(key, -value);
	}

	create(key) {
		if (! this.getItem(key)) {
			this.setItem(key, 0);
		}
	}

	remove(key) {
		this.setItem(key, null);
	}

	saveItem(key) {
		var value = this.getItem(key);
		if (value === null) {
			console.log('value null for item, removing:', key, value)
			localStorage.removeItem(key);
		} else {
			// console.log('setting value for item:', key, value)
			localStorage.setItem(key, value);
		}
	}

	loadHooks(key) {
		if (key.endsWith('_type')) {
			var block_id = key.replace(/_type/, '');
			var blocktype = this.getItem(key);
			if ((blocktype !== undefined) && (blocktype !== "empty")) {
				Machines3d.create(block_id, blocktype, false);
			}
		}
	}

	loadItem(key) {
		var value = localStorage.getItem(key);
		this.setItem(key, value);
		this.loadHooks(key);
	}

	saveAll() {
		console.log('called function saveAll');

		var self = this;
		this.keys().forEach(function(item) {
			self.saveItem(item);
		});
	}

	loadAll() {
		console.log('called function loadAll');
		Machines3d.reset();

		var self = this;
		Object.keys(localStorage).forEach(function(item) {
			self.loadItem(item);
		});
	}

	clearAll() {
		console.log('called function clearAll');
		this.keys().forEach(function(item) {
			console.log('DELETE', item);
			localStorage.removeItem(item);
		});
	}

	round(value, factor) {
		return Math.round(value * factor) / factor;
	}

	pad2 = function(val) {
		return val.toString().padStart(2, '0');
	}

	format_money = function(val) {
		return "$"+val.toFixed(2);
	}

	update_display() {
		// console.log('called function Data.update_display');
		var self = this;
		this.keys().forEach(function(item) {
			var new_value = self.getItem(item);
			var data_dom = $('#data_'+item);
			if (data_dom.html() != new_value) {
				data_dom.html(new_value);
			}
		});
	}

	heart_beat() {
		this.add('time', 1);
	}
}

var Data3d = new Data();
