/* 3dprint_game/js/3d-menu.js */

console.log('file 3d-menu.js: start');

class Menu {
	constructor(label, click_function) {
		var lb = $(".menubar");
		var menudiv = $('<div>')
			.text(label)
			.addClass("menu")
			.click(click_function);
		lb.append(menudiv);
	}
} // end class Menu

class Menus {
	menu_store = {};

	constructor() {
		// nothing yet
	}

	get(label) {
		return this.menu_store[label];
	}

	put(label, ob) {
		this.menu_store[label] = ob;
	}

	create(label, click_function) {
		if (! this.get(label)) {
			var ob = new Menu(label, click_function);
			this.put(label, ob);
		}
	}

	// function setup_menus must ONLY be called after document.ready
	setup_menus() {
		var self = this;
		var M;

		var menu_functions = {
			'CLEAR':  clear_all_data,
			'RESET':  initialize_data,
			'LOAD':   load_data,
			'SAVE':   save_data,
			'UPDATE': update_screen,
			'HB +/-': toggle_heart_beats,
		};

		Object.keys(menu_functions).forEach(function(label) {
			self.create(label, menu_functions[label]);
		});
	}
}

Menus3d = new Menus();

var setup_menus_RENAME_ISTHISUSED = function () {
}

console.log('file 3d-menu.js: end');
