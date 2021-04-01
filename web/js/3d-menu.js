/* 3dprint_game/js/3d-menu.js */

var menus    = [];

class Menu {
	constructor(label, click_function) {
		var lb = $(".leftbar");
		var menudiv = $('<div>')
			.text(label)
			.addClass("menu")
			.click(click_function);
		lb.append(menudiv);
		menus.push(this);
	}
} // end class Menu

// function setup_menus must ONLY be called after document.ready
var setup_menus = function () {
	var M;

	var menu_labels = {
		'CLEAR':  clear_all_data,
		'RESET':  initialize_data,
		'LOAD':   load_data,
		'SAVE':   save_data,
		'UPDATE': update_screen,
		'HB +/-': toggle_heart_beats,
	};

	Object.keys(menu_labels).forEach(function(item, index) {
		M = new Menu(item, menu_labels[item]);
	});
}
