/* 3dprint_game/js/3dprint-menu.js */

var menus    = [];

class Menu {
	constructor(label, click_function) {
		var L = $(".leftbar");
		var menudiv = $('<div>')
			.text(label)
			.addClass("menu")
			.click(click_function);
		L.append(menudiv);
		menus.push(this);
	}
} // end class Menu

var setup_menus = function () {
	var M;

	var menu_labels = {
		'CLEAR':  clear_all_data,
		'RESET':  initialize_data,
		'LOAD':   load_data,
		'SAVE':   save_data,
		'UPDATE': update_screen,
		'TICK':   heart_beat,
	};

	Object.keys(menu_labels).forEach(function(item, index) {
		M = new Menu(item, menu_labels[item], D);
	});
}
