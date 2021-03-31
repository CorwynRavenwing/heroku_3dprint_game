/* 3dprint_game/js/3d-data.js */

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
		if (! temp) { temp = 0; }
		temp = Math.round( temp * 1000 ) / 1000;
		return temp;
	}

	setItem(key, value) {
		this.data_store[key] = value;
	}

	add(key, value) {
		this.setItem(key, this.getNumber(key) + value);
	}

	subtract(key, value) {
		this.add(key, -value);
	}

	remove(key) {
		this.setItem(key, null);
	}

	saveItem(key) {
		var value = this.getItem(key);
		if (value === null) {
			console.log('value null for item, removing:', key, value)
			localStorage.remove(key);
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
				var m = new Machine(block_id, blocktype, this, false);
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
		reset_machines();

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

	update_display() {
		console.log('called function Data.update_display');
		var self = this;
		this.keys().forEach(function(item) {
			$('#data_'+item).html(self.getItem(item));
		});
	}

	heart_beat() {
		this.add('time', 1);
	}
}

var D = new Data();
