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

module.exports.Menu = Menu;
